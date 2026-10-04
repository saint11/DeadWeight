const YAML = require('js-yaml');

// Local port of the abandoned markdown-it-meta package (which pinned js-yaml 3):
// parses a leading "---" YAML front matter block into md.meta
module.exports = function meta_plugin(md) {
    md.meta = md.meta || {};

    function getLine(state, line) {
        const pos = state.bMarks[line];
        const max = state.eMarks[line];
        return state.src.substr(pos, max - pos);
    }

    function meta(state, start, end, silent) {
        if (start !== 0 || state.blkIndent !== 0) return false;
        if (state.tShift[start] < 0) return false;
        if (!getLine(state, start).match(/^---$/)) return false;

        const data = [];
        let line = start;
        while (line < end) {
            line++;
            const str = getLine(state, line);
            if (str.match(/^---$/)) break;
            if (state.tShift[line] < 0) break;
            data.push(str);
        }

        md.meta = YAML.load(data.join('\n'), { json: true }) || {};
        state.line = line + 1;
        return true;
    }

    md.block.ruler.before('code', 'meta', meta, { alt: [] });
}
