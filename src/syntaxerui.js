import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { addListToDropdown, createDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import Model from '@ckeditor/ckeditor5-ui/src/model';

import syntaxerIcon from './../theme/icons/syntaxer.svg';
import '../theme/syntaxer.css';

export default class SyntaxerUI extends Plugin {
	init() {
		const editor = this.editor;
		const t = editor.t;
        const languages = editor.config.get('syntaxer.languages');

		editor.ui.componentFactory.add( 'syntaxer', locale => {
            const dropdownView = createDropdown(locale);

            addListToDropdown(dropdownView, getDropdownItemsDefinitions(languages)); // arguments : DropdownView, Collection

            dropdownView.buttonView.set({
                label: t('Syntaxer'),
                tooltip: true,
                icon: syntaxerIcon
            });

            this.listenTo(dropdownView, 'execute', evt => {
                editor.execute('syntaxer', { language: evt.source.commandParam });
                editor.editing.view.focus();
            });

            return dropdownView;
		} );
    }
}

function getDropdownItemsDefinitions(languages) {
    const itemDefinitions = new Collection();

    for (const name of languages) {
        const definition = {
            type: 'button',
            model: new Model({
                commandParam: name,
                label: name,
                withText: true
            })
        };

        itemDefinitions.add(definition);
    }

    return itemDefinitions;
}
