import { CommonEmitFunction, Input } from '@any-touch/shared';
import {
    STATUS_FAILED, STATUS_RECOGNIZED, DIRECTION_UP, INPUT_CANCEL, INPUT_END, INPUT_START
} from '@any-touch/shared';
import { ComputeDistance } from '@any-touch/compute';
import Recognizer, { resetStatusForPressMoveLike as resetStatus } from '@any-touch/recognizer';

export default class extends Recognizer {
    private _timeoutId?: number;
    static DEFAULT_OPTIONS = {
        name: 'press',
        pointLength: 1,
        positionTolerance: 9,
        minPressTime: 251,
    };
    constructor(options = {}) {
        super(options);
    };

    recognize(input: Input, emit: CommonEmitFunction): void {
        const { inputType, startInput, pointLength } = input;

        // 1. start阶段
        // 2. 触点数符合
        // 那么等待minPressTime时间后触发press
        if (INPUT_START === inputType && this.isValidPointLength(pointLength)) {
            // 重置状态
            resetStatus(this);
            // 延迟触发
            this.cancel();
            this._timeoutId = (setTimeout as Window['setTimeout'])(() => {
                this.status = STATUS_RECOGNIZED;
                emit(this.options.name, input);
            }, this.options.minPressTime);
        }
        // 触发pressup条件:
        // 1. end阶段
        // 2. 已识别
        else if (INPUT_END === inputType && STATUS_RECOGNIZED === this.status) {
            emit(`${this.options.name}${DIRECTION_UP}`, this.computed);
        }
        else {
            const deltaTime = input.timestamp - startInput.timestamp;
            // 一旦不满足必要条件,
            // 发生了大的位移变化
            if (!this.test(input) || 
            // end 或 cancel触发的时候还不到要求的press触发时间
            (this.options.minPressTime > deltaTime && [INPUT_END, INPUT_CANCEL].includes(inputType))) {
                this.cancel();
                this.status = STATUS_FAILED;
            }
        }
    };

    /**
     * 是否满足:
     * 移动距离不大
     */
    test(input: Input): boolean {
        const { pointLength } = input;
        type Computed = ReturnType<ComputeDistance['compute']>;
        this.computed = <Computed>this.compute([ComputeDistance], input);
        const { distance } = this.computed;
        return this.options.positionTolerance > distance;
    };

    cancel(): void {
        clearTimeout(this._timeoutId);
    }
};