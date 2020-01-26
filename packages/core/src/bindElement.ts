import { SupportEvent, SUPPORT_TOUCH, TOUCH_START, TOUCH_MOVE, TOUCH_END, TOUCH_CANCEL, MOUSE_DOWN, MOUSE_MOVE, MOUSE_UP } from '@any-touch/shared';
const TOUCH_EVENT_NAMES: ["touchstart", "touchmove", "touchend", "touchcancel"] = [TOUCH_START, TOUCH_MOVE, TOUCH_END, TOUCH_CANCEL];
/*
* 根据输入设备绑定事件
*/
export default function (el: HTMLElement, callback: (ev: SupportEvent) => void, options?: any): () => void {
    // Touch
    if (SUPPORT_TOUCH) {
        // https://stackoverflow.com/questions/55092588/typescript-addeventlistener-set-event-type
        TOUCH_EVENT_NAMES.forEach((eventName) => {
            el.addEventListener(eventName, callback);
        });
        return () => {
            TOUCH_EVENT_NAMES.forEach((eventName) => {
                el.removeEventListener(eventName, callback);
            });
        };
    }
    // Mouse
    else {
        el.addEventListener('mousedown', callback);
        window.addEventListener('mousemove', callback);
        window.addEventListener('mouseup', callback);
        return () => {
            el.removeEventListener('mousedown', callback);
            window.removeEventListener('mousemove', callback);
            window.removeEventListener('mouseup', callback);
        };
    }
}