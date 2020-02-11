/**
 * 主程序, 不包含手势,
 * 主要用来适配Mouse/Touch事件
 * ==================== 参考 ====================
 * https://segmentfault.com/a/1190000010511484#articleHeader0
 * https://segmentfault.com/a/1190000007448808#articleHeader1
 * hammer.js http://hammerjs.github.io/
 */
import AnyEvent from 'any-event';
import { SupportEvent, Recognizer, Input } from '@any-touch/shared';
import InputFactory from './Input';
import dispatchDomEvent from './dispatchDomEvent';
import canPreventDefault from './canPreventDefault';
import bindElement from './bindElement';
import { use, removeUse } from './use';
// type TouchAction = 'auto' | 'none' | 'pan-x' | 'pan-left' | 'pan-right' | 'pan-y' | 'pan-up' | 'pan-down' | 'pinch-zoom' | 'manipulation';



export interface Options {
    domEvents?: false | EventInit;
    isPreventDefault?: boolean;
    // 不阻止默认行为的白名单
    preventDefaultExclude?: RegExp | ((ev: SupportEvent) => boolean);
}

// 默认设置
const DEFAULT_OPTIONS: Options = {
    domEvents: { bubbles: true, cancelable: true },
    isPreventDefault: true,
    preventDefaultExclude: /^(?:INPUT|TEXTAREA|BUTTON|SELECT)$/
};



export default class AnyTouch extends AnyEvent {
    static version = '__VERSION__';
    static recognizers: Recognizer[] = [];
    static recognizerMap: Record<string, Recognizer> = {};
    /**
     * 安装插件
     * @param {AnyTouchPlugin} 插件
     * @param {any[]} 插件参数
     */
    static use = (Recognizer: new (...args: any) => Recognizer, options?: Record<string, any>): void => {
        use(AnyTouch, Recognizer, options);
    };
    /**
     * 卸载插件
     */
    static removeUse = (recognizerName?: string): void => {
        removeUse(AnyTouch, recognizerName);
    };

    // 目标元素
    el?: HTMLElement;
    // 选项
    options: Options;
    // 统一转换器
    input: InputFactory;

    recognizerMap: Record<string, Recognizer> = {};
    recognizers: Recognizer[] = [];
    beforeEachHook: any;
    /**
     * @param {Element} 目标元素, 微信下没有el
     * @param {Object} 选项
     */
    constructor(el?: HTMLElement, options?: Options) {
        super();
        this.el = el;

        // 适配器
        this.input = new InputFactory();
        this.options = { ...DEFAULT_OPTIONS, ...options };

        // 同步到插件到实例
        this.recognizerMap = AnyTouch.recognizerMap;
        this.recognizers = AnyTouch.recognizers;

        // 绑定事件
        if (void 0 !== this.el) {
            
            // 校验是否支持passive
            let supportsPassive = false;
            try {
                const opts = {};
                Object.defineProperty(opts, 'passive', ({
                    get: function get() {
                        // 不想暴露, 会增加体积, 暂时忽略
                        /* istanbul ignore next */ 
                        supportsPassive = true;
                    }
                }));
                window.addEventListener('_', () => void 0, opts);
            } catch{ }
            this._unbindEl = bindElement(this.el, this.catchEvent.bind(this), !this.options.isPreventDefault && supportsPassive ? { passive: true } : false);
        }
    }

    /**
     * 使用插件
     * @param {AnyTouchPlugin} 插件
     * @param {Object} 选项
     */
    use(Recognizer: new (...args: any) => Recognizer, options?: Record<string, any>): void {
        use(this, Recognizer, options);
    };

    /**
     * 移除插件
     * @param {String} 识别器name
     */
    removeUse(name?: string): void {
        removeUse(this, name);
    };

    /**
     * 监听input变化s
     * @param {Event}
     */
    catchEvent(event: SupportEvent): void {
        if (canPreventDefault(event, this.options)) {
            event.preventDefault();
        }
        // if (!event.cancelable) {
        //     this.eventEmitter.emit('error', { code: 0, message: '页面滚动的时候, 请暂时不要操作元素!' });
        // }

        // 统一不同输入
        const input = this.input.transform(event);
        // 跳过无效输入
        // 当是鼠标事件的时候, 会有undefined的时候
        // 比如鼠标还没有mousedown阶段的mousemove等都是无效操作
        if (void 0 !== input) {
            // 管理历史input
            // 生成AnyTouchEvent
            // if (void 0 !== AnyTouch.recognizers[0]) {
            //     AnyTouch.recognizers[0].input = input;
            // }
            const AT_TOUCH = 'at:touch';
            const AT_TOUCH_WITH_STATUS = AT_TOUCH + input.inputType;

            this.emit(AT_TOUCH, input);
            this.emit(AT_TOUCH_WITH_STATUS, input);

            if (false !== this.options.domEvents) {
                const { target } = event;
                if (null !== target) {
                    dispatchDomEvent(target, { ...input, type: AT_TOUCH }, this.options.domEvents);
                    dispatchDomEvent(target, { ...input, type: AT_TOUCH_WITH_STATUS }, this.options.domEvents);
                }
            }
            // 缓存每次计算的结果
            // 以函数名为键值

            let computedGroup = {};
            for (const recognizer of this.recognizers) {
                if (recognizer.disabled) continue;
                recognizer.input = input;
                recognizer.computedGroup = computedGroup;
                recognizer.recognize(input, (type, ev) => {
                    const payload = { ...input, ...ev, type, baseType: recognizer.name };
                    if (void 0 === this.beforeEachHook) {
                        this.emit2(payload);
                    } else {
                        this.beforeEachHook(recognizer, () => {
                            this.emit2(payload);
                        });
                    }
                });
                computedGroup = recognizer.computedGroup;
            }
        }
    };

    beforeEach(hook: (active: Recognizer, next: () => void) => void): void {
        this.beforeEachHook = hook;
    };

    /**
     * 同时出发内部/dom事件
     * @param {Object} 事件对象 
     * @param {string} 当前输入状态
     */
    emit2(payload: Record<string, any> & Input) {
        const { type, target } = payload;
        this.emit('at:after', payload);
        this.emit(type, payload);
        // 构造函数绑定的根元素或者target指定的元素
        // 如果使用了target方法
        // 那么realTarget指向target传入的元素
        if (false !== this.options.domEvents
            && void 0 !== this.el
            && void 0 !== target
            && null !== target
        ) {
            // vue会把绑定元素的所有子元素都进行事件绑定
            // 所以此处的target会自动冒泡到目标元素
            dispatchDomEvent(target, payload, this.options.domEvents);
            dispatchDomEvent(target, { ...payload, type: 'at:after' }, this.options.domEvents);
        }
    };

    /**
     * 获取识别器通过名字
     * @param {String} 识别器的名字
     * @return {Recognizer|undefined} 返回识别器
     */
    get(name: string): Recognizer | void {
        return this.recognizerMap[name];
    };

    /**
     * 设置
     * @param {Options} 选项
     */
    set(options: Options): void {
        this.options = { ...this.options, ...options };
    };

    /**
     * 解绑所有触摸事件
     */
    private _unbindEl(): void { };

    /**
     * 销毁
     */
    destroy() {
        // 解绑事件
        if (this.el) {
            this._unbindEl();
        }
        this.callbackMap = {};
    };
}