import { radianToAngle } from '@any-touch/vector';
import type { Input } from '@any-touch/shared';

function ComputeDeltaXY() {
    return function (input: Input) {
        const { prevInput } = input;
        let deltaX = 0;
        let deltaY = 0;

        // 计算deltaX/Y
        if (void 0 !== prevInput) {
            deltaX = input.x - prevInput.x;
            deltaY = input.y - prevInput.y;
        }

        return { deltaX, deltaY, getXYAngle };
    }
}

/**
 * 计算xy形成的夹角
 * @param x x轴值
 * @param y y轴值
 * @returns xy形成的夹角
 */
function getXYAngle(x = 0, y = 0) {
    if (0 === x) {
        return 0;
    } else {
        const deltaXY = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        return Math.round(radianToAngle(Math.acos(Math.abs(x) / deltaXY)));
    }
}

ComputeDeltaXY._id = `__ComputeDeltaXY__`;
export default ComputeDeltaXY;