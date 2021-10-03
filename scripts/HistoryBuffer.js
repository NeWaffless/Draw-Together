// acts like a circular buffer
// buffer size is 1 larger than number of elements
// extra space is used for fin ptr
class HistoryBuffer {
    constructor(size) {
        this.arr = [];
        this.start = 0;
        this.fin = 0;
        this.ptr = 0;
        this.size = size;
    }
    
    inc(x) {
        return (x + 1) % (this.size + 1);
    }
    
    dec(x) {
        if(x - 1 < 0) return this.size;
        return x - 1;
    }
    
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
    
    undo() {
        if(this.inc(this.ptr) == this.start) return false;
        this.ptr = this.dec(this.ptr);
        return true;
    }
    
    // redo() {
    //     if(this.inc(this.ptr) == this.fin) return false;
    //     this.ptr = this.inc(this.ptr);
    //     return true;
    // }
}