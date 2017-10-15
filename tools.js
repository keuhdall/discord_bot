modules.exports = {
    getTimeFormat : time => {
        let newTime = new Object;
        newTime.hours = time / 3600;
        newTime.hours = Math.trunc(newTime.hours);
        newTime.minutes = time / 60;
        newTime.minutes = Math.trunc(newTime.minutes);
        newTime.minutes %= 60;
        newTime.seconds = time % 3600;
        newTime.seconds %= 60;
        return (newTime);
    },

    patchArgs : (args, index) => {
        let str = "";
        for (let i = index; i < args.length; i++) {
            str += args[i];
            if (i != args.length - 1)
                str += " ";
        }
        return str;
    }
}