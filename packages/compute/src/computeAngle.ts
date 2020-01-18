import { Vector } from '@any-touch/shared/types';
import {getAngle} from '@any-touch/vector';
export default function({
    startV, prevV, activeV
}: Record<string,Vector>): { angle: number, deltaAngle: number } {
    const deltaAngle = getAngle(activeV, prevV);
    const angle = getAngle(activeV, startV);
    return { angle, deltaAngle };
};