import { Computed, Input, CommonEmitFunction } from "@types";
import {
    INPUT_MOVE,
    PAN_Y,
    PAN_X,
    DIRECTION_LEFT,
    DIRECTION_RIGHT,
    DIRECTION_DOWN,
    DIRECTION_UP,
    DIRECTION_ALL,
    NONE,
    AUTO,
    INPUT_END
} from "@const";
import Recognizer from "@any-touch/Recognizer";
import ComputeDistance from "@any-touch/compute/ComputeDistance";
import ComputeDeltaXY from "@any-touch/compute/ComputeDeltaXY";
import ComputeVAndDir from "@any-touch/compute/ComputeVAndDir";
import recognizeForPressMoveLike from "@Recognizer/recognizeForPressMoveLike";
import isVaildDirection from "@Recognizer/isVaildDirection";

export default class PanRecognizer extends Recognizer {
    static DEFAULT_OPTIONS = {
        name: "pan",
        threshold: 10,
        pointLength: 1,
        directions: DIRECTION_ALL
    };

    constructor(options = {}) {
        super(options);
    }

    /**
     * @param {AnyTouchEvent} 计算数据
     * @return {Boolean}} .是否是当前手势
     */
    test(input: Input): boolean {
        const { inputType, pointLength } = input;

        const { direction, distance } = this.computed;
        return (
            INPUT_MOVE === inputType &&
            (this.isRecognized || this.options.threshold < distance) &&
            this.isValidPointLength(pointLength) &&
            isVaildDirection(this, direction)
        );
    }

    /**
     * 开始识别
     * @param {Input} 输入
     */
    recognize(input: Input, emit: CommonEmitFunction) {
        type Computed = ReturnType<ComputeVAndDir["compute"]> &
            ReturnType<ComputeDistance["compute"]> &
            ReturnType<ComputeDeltaXY["compute"]>;

        this.computed = <Computed>(
            this.compute([ComputeVAndDir, ComputeDistance, ComputeDeltaXY], input)
        );
        recognizeForPressMoveLike(this, input, emit);
        // panleft/panup/panright/pandown
        const { inputType } = input;
        if (INPUT_END !== inputType) {
            emit(this.options.name + this.computed.direction, this.computed);
        }
    }
}