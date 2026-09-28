import {
  Component,
  OnDestroy,
  Input,
  OnInit,
  OnChanges,
  SimpleChange,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  HostListener,
  ViewChild,
  ElementRef,
  Optional,
  Inject,
} from "@angular/core";
import { FormGenericSpinnerService } from "./form-generic-spinner.service";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import {
  LOADERS,
  DEFAULTS,
  Size,
  FormGenericSpinner,
  PRIMARY_SPINNER,
} from "./form-generic-spinner.enum";
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from "@angular/animations";
import { FormGenericSpinnerConfig, GENERIC_SPINNER_CONFIG  } from "./config";

@Component({
  selector: "form-generic-spinner",
  templateUrl: "form-generic-spinner.component.html",
  styleUrls: ["./form-generic-spinner.component.scss",
              "../animations/ball-8bits.css",
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
              "../animations/triangle-skew-spin.css"
            ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger("fadeIn", [
      state("in", style({ opacity: 1 })),
      transition(":enter", [style({ opacity: 0 }), animate(300)]),
      transition(":leave", animate(200, style({ opacity: 0 }))),
    ]),
  ],
})
export class FormGenericSpinnerComponent implements OnDestroy, OnInit, OnChanges {
  /**
   * To set backdrop color
   * Only supports RGBA color format
   * @memberof FormGenericSpinnerComponent
   */
  @Input() bdColor: string;
  /**
   * To set spinner size
   *
   * @memberof FormGenericSpinnerComponent
   */
  @Input() size: Size;
  /**
   * To set spinner color(DEFAULTS.SPINNER_COLOR)
   *
   * @memberof FormGenericSpinnerComponent
   */
  @Input() color: string;
  /**
   * To set type of spinner
   *
   * @memberof FormGenericSpinnerComponent
   */
  @Input()
  type!: string;
  /**
   * To toggle fullscreen mode
   *
   * @memberof FormGenericSpinnerComponent
   */
  @Input() fullScreen: boolean;
  /**
   * Spinner name
   *
   * @memberof FormGenericSpinnerComponent
   */
  @Input() name: string;
  /**
   * z-index value
   *
   * @memberof FormGenericSpinnerComponent
   */
  @Input() zIndex: number;
  /**
   * Custom template for spinner/loader
   *
   * @memberof FormGenericSpinnerComponent
   */
  @Input() template: string;
  /**
   * Show/Hide the spinner
   *
   * @type {boolean}
   * @memberof FormGenericSpinnerComponent
   */
  @Input() showSpinner: boolean;

  /**
   * To enable/disable animation
   *
   * @type {boolean}
   * @memberof FormGenericSpinnerComponent
   */
  @Input() disableAnimation: boolean = false;
  /**
   * Spinner Object
   *
   * @memberof FormGenericSpinnerComponent
   */
  spinner: FormGenericSpinner | any = new FormGenericSpinner();
  /**
   * Array for spinner's div
   *
   * @memberof FormGenericSpinnerComponent
   */
  divArray: Array<number>;
  /**
   * Counter for div
   *
   * @memberof FormGenericSpinnerComponent
   *
   */
  divCount: number;
  /**
   * Show spinner
   *
   * @memberof FormGenericSpinnerComponent
   **/
  show: boolean;
  /**
   * Unsubscribe from spinner's observable
   *
   * @memberof FormGenericSpinnerComponent
   **/
  ngUnsubscribe: Subject<void> = new Subject();
  /**
   * Element Reference
   *
   * @memberof FormGenericSpinnerComponent
   */
  @ViewChild("overlay")
  spinnerDOM!: { nativeElement: any; };

  // @HostListener("document:keydown", ["$event"])
  // handleKeyboardEvent(event: KeyboardEvent) {
  //   if (this.spinnerDOM && this.spinnerDOM.nativeElement) {
  //     if (
  //       this.fullScreen ||
  //       (!this.fullScreen && this.isSpinnerZone(event.target))
  //     ) {
  //       event.returnValue = false;
  //       event.preventDefault();
  //     }
  //   }
  // }

  /**
   * Creates an instance of FormGenericSpinnerComponent.
   *
   * @memberof FormGenericSpinnerComponent
   */
  constructor(
    private spinnerService: FormGenericSpinnerService,
    private changeDetector: ChangeDetectorRef,
    private elementRef: ElementRef,
    @Optional()
    @Inject(GENERIC_SPINNER_CONFIG)
    private globalConfig: FormGenericSpinnerConfig
  ) {
    this.bdColor = DEFAULTS.BD_COLOR;
    this.zIndex = DEFAULTS.Z_INDEX;
    this.color = DEFAULTS.SPINNER_COLOR;
    this.size = "large";
    this.fullScreen = true;
    this.name = PRIMARY_SPINNER;
    this.template = '';
    this.showSpinner = false;

    this.divArray = [];
    this.divCount = 0;
    this.show = false;
  }

  initObservable() {
    this.spinnerService
      .getSpinner(this.name)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((spinner: FormGenericSpinner) => {
        this.setDefaultOptions();
        Object.assign(this.spinner, spinner);
        if (spinner.show) {
          this.onInputChange();
        }
        this.changeDetector.detectChanges();
      });
  }

  /**
   * Initialization method
   *
   * @memberof FormGenericSpinnerComponent
   */
  ngOnInit() {
    this.setDefaultOptions();
    this.initObservable();
  }

  /**
   * To check event triggers inside the Spinner Zone
   *
   * @param {*} element
   * @returns {boolean}
   * @memberof FormGenericSpinnerComponent
   */
  isSpinnerZone(element: any): boolean {
    if (element === this.elementRef.nativeElement.parentElement) {
      return true;
    }
    return element.parentNode && this.isSpinnerZone(element.parentNode);
  }

  /**
   * To set default form-generic-spinner options
   *
   * @memberof FormGenericSpinnerComponent
   */
  setDefaultOptions = () => {
    const { type } = this.globalConfig ?? {};
    this.spinner = FormGenericSpinner.create({
      name: this.name,
      bdColor: this.bdColor,
      size: this.size,
      color: this.color,
      type: this.type ?? type,
      fullScreen: this.fullScreen,
      divArray: this.divArray,
      divCount: this.divCount,
      show: this.show,
      zIndex: this.zIndex,
      template: this.template,
      showSpinner: this.showSpinner,
    });
  };
  /**
   * On changes event for input variables
   *
   * @memberof FormGenericSpinnerComponent
   */
  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    for (const propName in changes) {
      if (propName) {
        const changedProp = changes[propName];
        if (changedProp.isFirstChange()) {
          return;
        } else if (
          typeof changedProp.currentValue !== "undefined" &&
          changedProp.currentValue !== changedProp.previousValue
        ) {
          if (changedProp.currentValue !== "") {
            this.spinner[propName] = changedProp.currentValue;
            if (propName === "showSpinner") {
              if (changedProp.currentValue) {
                this.spinnerService.show(this.spinner.name, this.spinner);
              } else {
                this.spinnerService.hide(this.spinner.name);
              }
            }

            if (propName === "name") {
              this.initObservable();
            }
          }
        }
      }
    }
  }
  /**
   * To get class for spinner
   *
   * @memberof FormGenericSpinnerComponent
   */
  getClass(type: string, size: Size): string {
    this.spinner.divCount = (LOADERS as any)[type];
    this.spinner.divArray = Array(this.spinner.divCount)
      .fill(0)
      .map((_, i) => i);
    let sizeClass = "";
    switch (size.toLowerCase()) {
      case "small":
        sizeClass = "la-sm";
        break;
      case "medium":
        sizeClass = "la-2x";
        break;
      case "large":
        sizeClass = "la-3x";
        break;
      default:
        break;
    }
    return "la-" + type + " " + sizeClass;
  }
  /**
   * Check if input variables have changed
   *
   * @memberof FormGenericSpinnerComponent
   */
  onInputChange() {
    this.spinner.class = this.getClass(this.spinner.type, this.spinner.size);
  }
  /**
   * Component destroy event
   *
   * @memberof FormGenericSpinnerComponent
   */
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
