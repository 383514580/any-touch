import { BaseInput, InputType } from '@any-touch/shared';
import Adapter from './Abstract';
export default class extends Adapter {
    load(event: TouchEvent): Omit<BaseInput, 'id'> {
        // tip: wx下没有targetTouches
        const targets:EventTarget[] = [];
        const points = Array.from(event.touches).map(({ clientX, clientY,target }) => {
            targets.push(target);
            return { clientX, clientY,target}
        });
        const changedPoints = Array.from(event.changedTouches).map(({ clientX, clientY,target }) => ({ clientX, clientY ,target}));
        return {
            inputType: <InputType>event.type.replace('touch', ''),
            changedPoints,
            points,
            nativeEvent: event,
            target: event.target,
            targets
        };
    }
}; 