import Base from '@/recognitions/Base';
import RecognizerWithRequireFailureType from '@/recognitions/RecognizerWithRequireFailure';
export type Recognizer = Base | RecognizerWithRequireFailure;
export type RecognizerWithRequireFailure = RecognizerWithRequireFailureType;

import _Store from '@/Store';
// export type Store = InstanceType<_Store>;
export type Store = _Store;


export type AEvent = any;
// export 
// 适配器支持的事件类型
export type SupportEvent = MouseEvent | TouchEvent;

export type directionString = 'up' | 'right' | 'down' | 'left' | 'none';
export type RecognizerStatus = 'possible' | 'recognized' | 'began' | 'changed' | 'ended' | 'failed' | 'cancelled';
export type eventType = 'start' | 'move' | 'end' | 'cancel';

export interface Point {
    x: number;
    y: number;
}

export type Vector = Point;

// 输入记录
export type InputRecord = {
    input: Input;
    startInput: Input;
    prevInput?: Input;
    startMultiInput?: Input;
}

export interface BaseInput {
    readonly id: number;
    readonly eventType: eventType;
    readonly changedPoints: { clientX: number, clientY: number }[];
    readonly points: { clientX: number, clientY: number }[];
    readonly nativeEvent: Event;
}

export interface Input extends BaseInput {
    
    readonly preventDefault: () => void;
    // 新一轮手势识别的开始和结束
    readonly isStart: boolean;
    readonly isEnd: boolean;
    readonly pointLength: number;
    // 发生改变的触点数据
    // readonly changedPointLength: number;
    // 当前时间
    readonly timestamp: number;
    readonly target: EventTarget | null;
    readonly currentTarget: EventTarget | null;
    readonly center?: Point;
    // 同centerX/Y
    readonly x: number;
    readonly y: number;
}

export interface Computed {
    // 一次识别周期中出现的最大触点数
    maxPointLength?: number;
    velocityX: number;
    velocityY: number;
    speedX: number;
    speedY: number;
    scale: number;
    deltaScale: number;
    angle: number;
    deltaAngle: number;
    deltaX: number;
    deltaY: number;
    deltaXYAngle: number;
    displacementX: number;
    displacementY: number;

    distanceX: number;
    distanceY: number;
    distance: number;
    deltaTime: number;
    // 与起始点的偏移方向
    overallDirection?: directionString;
    // 瞬时方向
    direction?: directionString;
}

export interface AnyTouchEvent extends Input, Readonly<Computed>{
    readonly type: string
}


// 通过css阻止浏览器默认设置
export interface CSSPreventMap extends CSSStyleDeclaration {
    'userSelect': 'none';
    'mozUserSelect': 'none';
    'msUserSelect': 'none';
    'webkitUserSelect': 'none';
    // https://developer.mozilla.org/en-US/docs/Web/CSS/msTouchSelect
    // 禁用选择文字, 在winphone下
    'msTouchSelect': 'none';
    'webkitTapHighlightColor': 'rgba(0,0,0,0)';
    'webkitUserDrag': 'none';
    // 当你触摸并按住触摸目标时候，
    // 禁止或显示系统默认菜单。
    // 在iOS上，当你触摸并按住触摸的目标，
    // 比如一个链接，Safari浏览器将显示链接有关的系统默认菜单。
    // 这个属性可以让你禁用系统默认菜单。
    'webkitTouchCallout': 'none';
}