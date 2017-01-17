/*
    Some Math functions
*/


export const PI2 = 2.0 * Math.PI,
    HALF_PI = Math.PI * 0.5,
    DEG2RAD = Math.PI / 180.0,
    RAD2DEG = 180.0 / Math.PI,
    EPS = 10e-6;


// Lineary interpolates between a->b, using n as a weightath
export const mix = ( n, a, b ) =>  a * ( 1 - n ) + b * n;


// Linearly maps n from a->b to x->y
export const map =  ( n, a, b, x, y ) => x + ( n - a ) * ( y - x ) / ( b - a );


// Linearly maps n from a->b to 0-1
export const normalize = ( n, a, b ) => map( n, a, b, 0, 1 );


// Clamp n within range a->b
export const clamp = ( n, a, b ) => ( n < a ) ? a : (( n > b ) ? b : n );


//Returns the value of bit in position `i` in `n`
export const bitValue = ( n, i ) => n & ( 1 << i );


/*
 * Returns a pseudo-random floating point number within the range a->b, if b is not supplied it
 * returns within the range 0-a
 */
export const random = (a, b) => {
    a = a === undefined ? 1 : a
    return (b === undefined) ? Math.random() * a : Math.random() * (b - a) + a;
}


/*
 * Included for completeness. This allows functional style reductions such as `numbers.reduce( max )`. 
 * `Math.max.apply( this, []] )` alone is bound by the stack size
 */
export const max = ( a, b ) => Math.max( a, b );
export const min = ( a, b ) => Math.min( a, b );

/*
 * Lerps between two numbers.
 */
export const lerp = ( control, from, to) => Math.ceil( from + ( to - from ) * control );


/*
 * Converts a value from a source range to a destination range.
 */
export const convertToRange = (value, srcRange, dstRange) => {
	if (value < srcRange[0]) return dstRange[0];
	if (value > srcRange[1]) return dstRange[1];

	const srcMax = srcRange[1] - srcRange[0];
	const dstMax = dstRange[1] - dstRange[0];
	const adjValue = value - srcRange[0];

	return (adjValue * dstMax / srcMax) + dstRange[0];
};

/*
 * Oscilates between 1 and -1, given an input, i
 */
export const osc = ( i ) => return ( Math.floor( i ) % 2 === 0 ) ? i % 1 - 0.5 : 1 - ( i % 1 ) -0.5;

