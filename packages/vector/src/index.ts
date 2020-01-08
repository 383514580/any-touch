import {DIRECTION_UP, DIRECTION_DOWN, DIRECTION_RIGHT, DIRECTION_LEFT, NONE } from '@any-touch/const';
import { directionString, Point, Vector } from '@types';
/**
 * 获取向量长度(向量模)
 * @param {Object} 向 量
 */
export const getVLength = (v: Vector): number => {
    return Math.sqrt(v.x * v.x + v.y * v.y);
}

/**
 * 点积
 * @param {Object} v1
 * @param {Object} v2
 */
export const getDotProduct = (v1: Vector, v2: Vector) => {
    return v1.x * v2.x + v1.y * v2.y;
}

/**
 * 向量夹角(弧度)
 * @param {Object} v1
 * @param {Object} v2
 */
export const getRadian = (v1: Vector, v2: Vector) => {
    var mr = getVLength(v1) * getVLength(v2);
    if (mr === 0) return 0;
    var r = getDotProduct(v1, v2) / mr;
    if (r > 1) r = 1;
    return Math.acos(r);
}

/**
 * 求旋转方向
 * 顺时针/逆时针
 */
export const getCross = (v1: Vector, v2: Vector) => {
    return v1.x * v2.y - v2.x * v1.y;
}

/**
 * 向量夹角(角度)
 * @param {Object} v1
 * @param {Object} v2
 */
export const getAngle = (v1: Vector, v2: Vector) => {
    var angle = getRadian(v1, v2);
    if (getCross(v1, v2) > 0) {
        angle *= -1;
    }
    return radianToAngle(angle);
};

/**
 * 弧度转角度
 * @param {Number} 弧度 
 */
export const radianToAngle = (radian: number): number => radian / Math.PI * 180;

/**
 * 角度转弧度
 * @param {Number} 角度 
 */
export const angleToRadian = (angle: number): number => angle / 180 * Math.PI;



/**
 * 
 * @param {Number} 事件开始到结束的X位移 
* @param {Number} 事件开始到结束的Y位移 
 */
export const getDirection = (x: number, y: number): directionString => {
    if (x === y) {
        return NONE;
    } else if (Math.abs(x) > Math.abs(y)) {
        return 0 < x ? DIRECTION_RIGHT : DIRECTION_LEFT;
    } else {
        return 0 < y ? DIRECTION_DOWN : DIRECTION_UP;
    }
};
