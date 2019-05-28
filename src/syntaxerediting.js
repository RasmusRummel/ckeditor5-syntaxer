import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { toWidgetEditable } from '@ckeditor/ckeditor5-widget/src/utils';

import SyntaxerCommand from './syntaxercommand';

export default class SyntaxerEditing extends Plugin {
    init() {
        this._defineSchema();
        this._defineConverters(); 

		const editor = this.editor;
		const schema = editor.model.schema;

        editor.commands.add('syntaxer', new SyntaxerCommand(editor));

        schema.addChildCheck((ctx, childDef) => {
            if (ctx.endsWith('syntaxer') && childDef.name == 'syntaxer') {
                return false;
            }
        });
		
        editor.model.document.registerPostFixer(writer => {
            const changes = editor.model.document.differ.getChanges();

            for (const entry of changes) {
                if (entry.type == 'insert') {
                    const element = entry.position.nodeAfter;

                    if (!element) {
                        continue;
                    }

                    if (element.is('syntaxer') && element.isEmpty) {
                        writer.remove(element);

                        return true;
                    }
                    else if (element.is('syntaxer') && !schema.checkChild(entry.position, element)) {
                        writer.unwrap(element);

                        return true;
                    }
                    else if (element.is('element')) {
                        const range = writer.createRangeIn(element);

                        for (const child of range.getItems()) {
                            if (child.is('syntaxer') && !schema.checkChild(writer.createPositionBefore(child), child)) {
                                writer.unwrap(child);

                                return true;
                            }
                        }
                    }
                }
                else if (entry.type == 'remove') {
                    const parent = entry.position.parent;

                    if (parent.is('syntaxer') && parent.isEmpty) {
                        writer.remove(parent);

                        return true;
                    }
                }
            }

            return false;
        });
    }

    _defineSchema() {
        const schema = this.editor.model.schema;

        schema.register('syntaxer', {
            allowWhere: '$block',
            allowContentOf: '$root',
            allowAttributes: ['class']
        });
    }

    _defineConverters() {
        const conversion = this.editor.conversion;
        var wrapperElement = this.editor.config.get('syntaxer.element');
        console.log("wrapperElement = " + wrapperElement);

        conversion.for('upcast').elementToElement({
            view: () => {
                return { name: this.editor.config.get('syntaxer.element'), classes: ['code'] };
            },
            model: (viewElement, modelWriter) => {
                var cssClass = viewElement.getAttribute('class');
                return modelWriter.createElement('syntaxer', { class: cssClass });
            }
        });

        conversion.for('editingDowncast').elementToElement({
            model: 'syntaxer',
            view: (modelItem, viewWriter) => {
                const syntaxer = createSyntaxerView(modelItem, viewWriter, this.editor);
                return toWidgetEditable(syntaxer, viewWriter);
            }
        });

        conversion.for('dataDowncast').elementToElement({
            model: 'syntaxer',
            view: (modelItem, viewWriter) => {
                const cssClass = modelItem.getAttribute('class');
                const syntaxer = viewWriter.createContainerElement(this.editor.config.get('syntaxer.element'), { class: cssClass });

                return syntaxer;
            }
        });

        conversion.for('editingDowncast').attributeToAttribute({
            model: {
                name: 'syntaxer',
                key: 'class'
            },
            view: {
                key: 'class'
            }
        });


        function createSyntaxerView(modelItem, viewWriter, editor) {
            const cssClass = modelItem.getAttribute('class');
            const syntaxer = viewWriter.createContainerElement(editor.config.get('syntaxer.element'));

            return syntaxer;
        }
    }

	afterInit() {
		const editor = this.editor;
		const command = editor.commands.get( 'syntaxer' );

		this.listenTo( this.editor.editing.view.document, 'enter', ( evt, data ) => {
			const doc = this.editor.model.document;  
			const positionParent = doc.selection.getLastPosition().parent;

			if ( doc.selection.isCollapsed && positionParent.isEmpty && command.value ) {
				this.editor.execute( 'syntaxer' );
				this.editor.editing.view.scrollToTheSelection();

				data.preventDefault();
				evt.stop();
			}
		} );
	}
}
