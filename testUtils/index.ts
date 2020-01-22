import AnyTouch from '@any-touch/core';
import { GestureSimulator, sleep } from '@any-touch/simulator';
export function create() {
    const el = document.createElement('div');
    const at = new AnyTouch(el);
    const gs = new GestureSimulator(el);
    const mockCB = jest.fn();
    const { mock } = mockCB;
    const mockCalls = mock.calls;
    const{ dispatchTouchStart, dispatchTouchCancel, dispatchTouchEnd, dispatchTouchMove } = gs;
    return {
        dispatchTouchStart,
        dispatchTouchCancel,
        dispatchTouchEnd,
        dispatchTouchMove,
        gs,
        at,
        el,
        mockCB,
        mock,
        AnyTouch,
        sleep,
        mockCalls
    };
}
