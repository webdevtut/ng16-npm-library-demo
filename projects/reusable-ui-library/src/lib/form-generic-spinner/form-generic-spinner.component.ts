import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
  Optional,
  ViewChild,
  signal,
  computed,
  effect,
} from "@angular/core";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

import { FormGenericSpinnerService } from "./form-generic-spinner.service";

import {
  LOADERS,
  DEFAULTS,
  Size,
  FormGenericSpinner,
  PRIMARY_SPINNER,
} from "./form-generic-spinner.enum";

import {
  FormGenericSpinnerConfig,
  GENERIC_SPINNER_CONFIG,
} from "./config";

import {
  trigger,
  state,
  style,
  transition,
  animate,
} from "@angular/animations";

@Component({
  selector: "form-generic-spinner",
  templateUrl: "./form-generic-spinner.component.html",
  styleUrls: [
    "./form-generic-spinner.component.scss",

    // Your existing animations
    "../animations/ball-8bits.css",
    "../animations/ball-atom.css",
    "../animations/ball-beat.css",
    "../animations/ball-circus.css",
    "../animations/ball-climbing-dot.css",
    "../animations/ball-clip-rotate-multiple.css",
    "../animations/ball-clip-rotate-pulse.css",
    "../animations/ball-clip-rotate.css",
    "../animations/ball-elastic-dots.css",
    "../animations/ball-fall.css",
    "../animations/ball-fussion.css",
    "../animations/ball-grid-beat.css",
    "../animations/ball-grid-pulse.css",
    "../animations/ball-newton-cradle.css",
    "../animations/ball-pulse-rise.css",
    "../animations/ball-pulse-sync.css",
    "../animations/ball-pulse.css",
    "../animations/ball-rotate.css",
    "../animations/ball-running-dots.css",
    "../animations/ball-scale-multiple.css",
    "../animations/ball-scale-pulse.css",
    "../animations/ball-scale-ripple-multiple.css",
    "../animations/ball-scale-ripple.css",
    "../animations/ball-scale.css",
    "../animations/ball-spin-clockwise-fade-rotating.css",
    "../animations/ball-spin-clockwise-fade.css",
    "../animations/ball-spin-clockwise.css",
    "../animations/ball-spin-fade-rotating.css",
    "../animations/ball-spin-fade.css",
    "../animations/ball-spin-rotate.css",
    "../animations/ball-spin.css",
    "../animations/ball-square-clockwise-spin.css",
    "../animations/ball-square-spin.css",
    "../animations/ball-triangle-path.css",
    "../animations/ball-zig-zag-deflect.css",
    "../animations/ball-zig-zag.css",
    "../animations/cog.css",
    "../animations/cube-transition.css",
    "../animations/fire.css",
    "../animations/line-scale-party.css",
    "../animations/line-scale-pulse-out-rapid.css",
    "../animations/line-scale-pulse-out.css",
    "../animations/line-scale.css",
    "../animations/line-spin-clockwise-fade-rotating.css",
    "../animations/line-spin-clockwise-fade.css",
    "../animations/line-spin-fade-rotating.css",
    "../animations/line-spin-fade.css",
    "../animations/pacman.css",
    "../animations/square-jelly-box.css",
    "../animations/square-loader.css",
    "../animations/square-spin.css",
    "../animations/timer.css",
    "../animations/triangle-skew-spin.css",
  ],

  changeDetection: ChangeDetectionStrategy.OnPush,

  animations: [
    trigger("fadeIn", [
      state("in", style({ opacity: 1 })),

      transition(":enter", [
        style({ opacity: 0 }),
        animate(300),
      ]),

      transition(":leave", [
        animate(200, style({ opacity: 0 })),
      ]),
    ]),
  ],
})
export class FormGenericSpinnerComponent {
  // -------------------------------------------------------
  // Inputs as signals
  // -------------------------------------------------------

  readonly bdColor = signal<string>(DEFAULTS.BD_COLOR);

  readonly size = signal<Size>("large");

  readonly color = signal<string>(
    DEFAULTS.SPINNER_COLOR
  );

  readonly type = signal<string>("");

  readonly fullScreen = signal<boolean>(true);

  readonly name = signal<string>(PRIMARY_SPINNER);

  readonly zIndex = signal<number>(DEFAULTS.Z_INDEX);

  readonly template = signal<string>("");

  readonly showSpinner = signal<boolean>(false);

  readonly disableAnimation = signal<boolean>(false);

  // -------------------------------------------------------
  // Internal state
  // -------------------------------------------------------

  readonly spinner = signal<FormGenericSpinner>(
    new FormGenericSpinner()
  );

  readonly show = signal<boolean>(false);

  /**
   * Number of child elements required by current loader.
   */
  readonly divCount = computed(() => {
    const loaderType = this.type();

    return (LOADERS as any)[loaderType] ?? 0;
  });

  /**
   * Child element indexes.
   */
  readonly divArray = computed(() =>
    Array.from(
      { length: this.divCount() },
      (_, index) => index
    )
  );

  /**
   * Size class for our spinner.
   */
  readonly sizeClass = computed(() => {
    switch (this.size().toLowerCase()) {
      case "small":
        return "pixel-loader-sm";

      case "medium":
        return "pixel-loader-2x";

      case "large":
        return "pixel-loader-3x";

      default:
        return "";
    }
  });

  /**
   * Final loader class.
   *
   * Example:
   *
   * pixel-loader-ball-8bits pixel-loader-3x
   */
  readonly loaderClass = computed(() => {
    const loaderType = this.type();

    if (!loaderType) {
      return this.sizeClass();
    }

    return [
      `pixel-loader-${loaderType}`,
      this.sizeClass(),
    ]
      .filter(Boolean)
      .join(" ");
  });

  /**
   * Whether spinner should currently be rendered.
   */
  readonly isVisible = computed(() => {
    return (
      this.showSpinner() ||
      this.spinner().show ||
      this.show()
    );
  });

  private readonly destroy$ = new Subject<void>();

  @ViewChild("overlay")
  spinnerDOM!: ElementRef;

  constructor(
    private readonly spinnerService: FormGenericSpinnerService,

    private readonly elementRef: ElementRef,

    @Optional()
    @Inject(GENERIC_SPINNER_CONFIG)
    private readonly globalConfig: FormGenericSpinnerConfig
  ) {
    /**
     * React whenever the public inputs change.
     */
    effect(() => {
      this.syncSpinnerState();
    });

    /**
     * React to spinner visibility changes.
     */
    effect(() => {
      const visible = this.showSpinner();

      if (visible) {
        const currentSpinner = this.spinner();

        this.spinnerService.show(
          currentSpinner.name,
          currentSpinner
        );
      } else {
        const currentSpinner = this.spinner();

        if (currentSpinner.name) {
          this.spinnerService.hide(
            currentSpinner.name
          );
        }
      }
    });
  }

  // -------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------

  ngOnInit(): void {
    this.setDefaultOptions();
    this.initObservable();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // -------------------------------------------------------
  // Spinner service
  // -------------------------------------------------------

  private initObservable(): void {
    this.spinnerService
      .getSpinner(this.name())
      .pipe(takeUntil(this.destroy$))
      .subscribe((spinner: FormGenericSpinner) => {
        this.spinner.update((current) => ({
          ...current,
          ...spinner,
        }));

        if (spinner.show) {
          this.syncSpinnerState();
        }
      });
  }

  // -------------------------------------------------------
  // State synchronization
  // -------------------------------------------------------

  private syncSpinnerState(): void {
    const currentSpinner = this.spinner();

    const updatedSpinner = FormGenericSpinner.create({
      name: this.name(),

      bdColor: this.bdColor(),

      size: this.size(),

      color: this.color(),

      type:
        this.type() ||
        this.globalConfig?.type ||
        currentSpinner.type,

      fullScreen: this.fullScreen(),

      divArray: this.divArray(),

      divCount: this.divCount(),

      show: this.show(),

      zIndex: this.zIndex(),

      template: this.template(),

      showSpinner: this.showSpinner(),
    });

    this.spinner.set(updatedSpinner);
  }

  private setDefaultOptions(): void {
    const configType =
      this.globalConfig?.type ?? "";

    this.type.set(
      this.type() || configType
    );

    this.syncSpinnerState();
  }

  // -------------------------------------------------------
  // Public API
  // -------------------------------------------------------

  showLoader(): void {
    this.showSpinner.set(true);
  }

  hideLoader(): void {
    this.showSpinner.set(false);
  }

  // -------------------------------------------------------
  // Compatibility helper
  // -------------------------------------------------------

  getClass(
    type: string,
    size: Size
  ): string {
    const sizeClass =
      this.getSizeClass(size);

    return [
      `pixel-loader-${type}`,
      sizeClass,
    ]
      .filter(Boolean)
      .join(" ");
  }

  private getSizeClass(size: Size): string {
    switch (size.toLowerCase()) {
      case "small":
        return "pixel-loader-sm";

      case "medium":
        return "pixel-loader-2x";

      case "large":
        return "pixel-loader-3x";

      default:
        return "";
    }
  }

  // -------------------------------------------------------
  // Spinner zone
  // -------------------------------------------------------

  isSpinnerZone(element: any): boolean {
    if (
      element ===
      this.elementRef.nativeElement.parentElement
    ) {
      return true;
    }

    return (
      element?.parentNode &&
      this.isSpinnerZone(element.parentNode)
    );
  }
}
