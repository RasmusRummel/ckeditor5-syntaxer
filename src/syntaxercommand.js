import Command from '@ckeditor/ckeditor5-core/src/command';
import first from '@ckeditor/ckeditor5-utils/src/first';

export default class SyntaxerCommand extends Command {
    refresh() {
        this.isSyntaxed = this._getIsSyntaxed();
        this.language = this._getLanguage();
        this.isEnabled = this._checkEnabled();
    }

    execute({ language }) {
        const model = this.editor.model;
        const schema = model.schema;
        const selection = model.document.selection;

        const blocks = Array.from(selection.getTopMostBlocks());
        const syntaxer = first(selection.getTopMostBlocks()).parent;

        model.change(writer => {
            if (this.language == language) {
                this._removeSyntaxer(writer, blocks.filter(findSyntaxer));
            }
            else {
                if (this.language) {
                    writer.setAttributes({ class: 'code ' + language }, syntaxer);
                }
                else {
                    const blocksToSyntax = blocks.filter(block => {
                        return findSyntaxer(block) || checkCanBeSyntaxed(schema, block);
                    });

                    this._applySyntaxer(writer, blocksToSyntax, language);
                }
            }
        });
    }

    _getIsSyntaxed() {
        const selection = this.editor.model.document.selection;
        const firstBlock = first(selection.getTopMostBlocks());

        return !!(firstBlock && findSyntaxer(firstBlock));
    }

    _getLanguage() {
        const selection = this.editor.model.document.selection;
        const firstBlock = first(selection.getTopMostBlocks());
        if (firstBlock) {
            const syntaxer = findSyntaxer(firstBlock);
            if (syntaxer) {
                var cssClass = syntaxer.getAttribute('class');
                var language = cssClass.substring('code '.length);

                return language;
            }
        }

        return '';
    }

    _checkEnabled() {
        if (this.isSyntaxed) {
            return true;
        }

        const selection = this.editor.model.document.selection;
        const schema = this.editor.model.schema;

        const firstBlock = first(selection.getSelectedBlocks());

        if (!firstBlock) {
            return false;
        }

        return checkCanBeSyntaxed(schema, firstBlock);
    }

    _removeSyntaxer(writer, blocks) {
        getRangesOfBlockGroups(writer, blocks).reverse().forEach(groupRange => {
            if (true || (groupRange.start.isAtStart && groupRange.end.isAtEnd)) {
                writer.unwrap(groupRange.start.parent);

                return;
            }

            if (groupRange.start.isAtStart) {
                const positionBefore = writer.createPositionBefore(groupRange.start.parent);

                writer.move(groupRange, positionBefore);

                return;
            }

            if (!groupRange.end.isAtEnd) {
                writer.split(groupRange.end);
            }

            const positionAfter = writer.createPositionAfter(groupRange.end.parent);

            writer.move(groupRange, positionAfter);
        });
    }

    _applySyntaxer(writer, blocks, language) {
        const syntaxersToMerge = [];

        const rangesOfBlockGroups = getRangesOfBlockGroups(writer, blocks);
        rangesOfBlockGroups.reverse().forEach(groupRange => {
            let syntaxer = findSyntaxer(groupRange.start);

            if (!syntaxer) {
                syntaxer = writer.createElement('syntaxer', { class: 'code ' + language });
                writer.wrap(groupRange, syntaxer);
            }

            syntaxersToMerge.push(syntaxer);
        });

        syntaxersToMerge.reverse().reduce((finalSyntaxer, nextSyntaxer) => {
            if (finalSyntaxer.nextSibling == nextSyntaxer) {
                writer.merge(writer.createPositionAfter(finalSyntaxer));

                return finalSyntaxer;
            }

            return nextSyntaxer;
        });
    }
}

function findSyntaxer(elementOrPosition) {
    return elementOrPosition.parent.name == 'syntaxer' ? elementOrPosition.parent : null;
}

function getRangesOfBlockGroups(writer, blocks) {
    let startPosition;
    let i = 0;
    const ranges = [];

    while (i < blocks.length) {
        const block = blocks[i];
        const nextBlock = blocks[i + 1];

        if (!startPosition) {
            startPosition = writer.createPositionBefore(block);
        }

        if (!nextBlock || block.nextSibling != nextBlock) {
            ranges.push(writer.createRange(startPosition, writer.createPositionAfter(block)));
            startPosition = null;
        }

        i++;
    }

    return ranges;
}

function checkCanBeSyntaxed(schema, block) {
    const isSyntaxerAllowed =  schema.checkChild(block.parent, 'syntaxer');
    const isBlockAllowedInSyntaxer = schema.checkChild(['$root', 'syntaxer'], block);

    return isSyntaxerAllowed && isBlockAllowedInSyntaxer;
}
