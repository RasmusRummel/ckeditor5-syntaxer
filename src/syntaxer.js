import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import SyntaxerEditing from './syntaxerediting';
import SyntaxerUI from './syntaxerui';

export default class Syntaxer extends Plugin {
    static get requires() {
        return [SyntaxerEditing, SyntaxerUI];
    }

    static get pluginName() {
        return 'Syntaxer';
    }
}
