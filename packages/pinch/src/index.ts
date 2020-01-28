import { Input, CommonEmitFunction } from '@any-touch/shared';
import { ComputeVectorForMutli, computeScale } from '@any-touch/compute';
import Recognizer, { recognizeForPressMoveLike } from '@any-touch/recognizer';

export default class extends Recognizer {
    static DEFAULT_OPTIONS = {
        name: 'pinch',
        // 触发事件所需要的最小缩放比例
        threshold: 0,
        pointLength: 2,
    };
    constructor(options = {}) {
        super(options);
    };

    /**
     * 识别条件
     * @param {AnyTouchEvent} 计算数据
     * @param {(isRecognized: boolean) => void}} 接收是否识别状态
     */
    test(input: Input): boolean {
        const { pointLength,inputType } = input;
        const { scale } = this.computed;
        return this.isValidPointLength(pointLength) && void 0 !== scale && (this.options.threshold < Math.abs(scale - 1) || this.isRecognized);
    };

    /**
     * 开始识别
     * @param {Input} 输入 
     */
    recognize(input: Input, emit: CommonEmitFunction) {
        type Computed = ReturnType<ComputeVectorForMutli['compute']> & {};
        const computed = <Computed>this.compute([ComputeVectorForMutli], input);
        if (`activeV` in computed) {
            // const {activeV, prevV,startV} = computed;
            this.computed = { ...this.computed, ...computeScale(computed) };
        }
        // console.log(this.computed);
        recognizeForPressMoveLike(this, input, emit);
    };
};