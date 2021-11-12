// acts like a circular array
// size of circular array is 1 greater than number of elements
    // extra space is a buffer for fin ptr
class HistoryBuffer {
    constructor(size) {
        this.arr = [];
        this.start = 0;
        this.fin = 0;
        this.ptr = 0;
        this.size = size;

        this.arr.length += this.size + 1;
        for(let i = 0; i < this.arr.length; i++) {
            this.arr[i] = {drawing: "", col: -1};
        }
    }
    
    inc(x) {
        return (x + 1) % (this.size + 1);
    }
    
    dec(x) {
        if(x - 1 < 0) return this.size;
        return x - 1;
    }
    
    // increments the circular array
    add() {
        this.ptr = this.inc(this.ptr);
        if(this.ptr == this.fin) {
            this.fin = this.inc(this.fin);
            if(this.fin == this.start) {
                this.start = this.inc(this.start);
            }
        } else {
            this.fin = this.inc(this.ptr);
        }
    }
    
    // decrements the circular array
    undo() {
        if(this.inc(this.ptr) == this.start) return false;
        this.ptr = this.dec(this.ptr);
        return true;
    }
}