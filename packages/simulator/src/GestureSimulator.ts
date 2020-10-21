interface Input {
    x: number;
    y: number;
    target?: HTMLElement
};
interface Options {
    device: 'touch' | 'mouse';
};

const CLIENT_X = 'clientX';
const CLIENT_Y = 'clientY';
export default class TouchSimulator {
    private _prevTouches: {
        clientX: number;
        clientY: number;
    }[];
    private _el: HTMLElement | Document;
    private _device: 'touch' | 'mouse';
    private _identifier: number;

    constructor(el: HTMLElement | Document, { device = 'touch' }: Options = { device: 'touch' }) {
        this._el = el;
        this._device = device;
        this._prevTouches = [];
        this._identifier = 1;
    };

    private _input2Points(input: Input[]) {
        return input.map(({ x, y, target }) => ({ [CLIENT_X]: x, [CLIENT_Y]: y, target: target || this._el }));
    }

    /**
     * 模拟touchstart
     * @param inputs 新增触点
     */
    public start(inputs: Input[] = [{ x: 0, y: 0 }]) {
        const points = this._input2Points(inputs);
        let type = 'touch' === this._device ? 'touchstart' : 'mousedown';
        let event: Record<string, any> & Event = new Event(type, { bubbles: true, cancelable: true });
        if ('touch' === this._device) {
            event.touches = [...this._prevTouches, ...points];
            event.targetTouches = event.touches;
            event.changedTouches = points;
            event.identifier = this._identifier++;
            this._prevTouches = event.touches;
        } else {
            event[CLIENT_X] = inputs[0].x;
            event[CLIENT_Y] = inputs[0].y;
            event.button = 0;
            const { clientX, clientY } = event;
            this._prevTouches = [{ clientX, clientY }];
        }

        this._el.dispatchEvent(event);
        return event;
    };

    /**
     * 模拟touchmove
     * @param inputs 触点
     */
    public move(inputs: Input[]) {
        const points = this._input2Points(inputs);
        let type = 'touch' === this._device ? 'touchmove' : 'mousemove';
        let event: Record<string, any> & Event = new Event(type, { bubbles: true, cancelable: true });

        if ('touch' === this._device) {
            if (points.length !== this._prevTouches.length) {
                throw new Error(`当前触点数: ${points.length}, 上一步触点数: ${this._prevTouches.length}`);
            }
            // 对应点不同就放进changedTouches;
            event.touches = points;
            event.targetTouches = points.filter(({ target }) => this._el === target);

            event.changedTouches = this._prevTouches.filter((prevTouchItem, index) => {
                const isXChanged = prevTouchItem[CLIENT_X] != points[index][CLIENT_X];
                const hasChanged = isXChanged || (prevTouchItem[CLIENT_Y] != points[index][CLIENT_Y]);
                return hasChanged && points[index];
            });

            this._prevTouches = event.touches;
            this._el.dispatchEvent(event);
        } else {
            event[CLIENT_X] = points[0][CLIENT_X];
            event[CLIENT_Y] = points[0][CLIENT_Y];
            window.dispatchEvent(event);
            this._prevTouches = points;
            this._el.dispatchEvent(event);
        }
        return event;
    };

    /**
     * 模拟touchend, 主要是从touchs中删除点, 语法模拟Array.splice
     * @param {ELement} dom元素
     * @param {Number} 删除点在touchs中的索引起始索引
     * @param {Number} 删除多少个点
     */
    public end(pointerIndex = 0, pointerNumber?: number) {
        let type = 'touch' === this._device ? 'touchend' : 'mouseup';
        let event: Record<string, any> & Event = new Event(type, { bubbles: true, cancelable: true });
        const { length } = this._prevTouches;
        const changePoints = this._prevTouches.splice(pointerIndex, pointerNumber || length);
        if ('touch' === this._device) {
            event.changedTouches = changePoints;
            event.touches = this._prevTouches;
            event.targetTouches = event.touches;
            this._prevTouches = event.touches;
            this._el.dispatchEvent(event);
        } else {
            this._el.dispatchEvent(event);
            window.dispatchEvent(event);
        }
        return event;
    };

    /**
     * 模拟touchcancel
     * @param dom元素 
     */
    public cancel() {
        if (void 0 === this._prevTouches) {
            throw new Error('不能单独触发Cancel!');
        }
        let event: Record<string, any> & Event = new Event('touchcancel', { bubbles: true, cancelable: true });
        event.changedTouches = this._prevTouches;
        event.touches = this._prevTouches;
        event.targetTouches = this._prevTouches;
        this._prevTouches = event.touches;
        this._el.dispatchEvent(event);
        return event;
    };
}
