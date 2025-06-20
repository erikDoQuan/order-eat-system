import { ButtonView, Command, Plugin, toWidget, toWidgetEditable, Widget } from 'ckeditor5';

class AddColumnCommand extends Command {
  override execute() {
    const editor = this.editor;
    const model = editor.model;
    const document = model.document;

    model.change(writer => {
      const selection = document.selection;

      const column = selection.getFirstPosition()?.parent.parent;

      if (column?.name === 'column') {
        const newColumn = writer.createElement('column');

        writer.appendElement('paragraph', newColumn);

        writer.insert(newColumn, writer.createPositionAfter(column));

        writer.setSelection(newColumn, 'in');
      }
    });
  }
}

class RemoveColumnCommand extends Command {
  override execute() {
    const editor = this.editor;
    const model = editor.model;
    const document = model.document;

    model.change(writer => {
      const selection = document.selection;
      const column = selection.getFirstPosition()?.parent.parent;
      const paragraph = selection.getFirstPosition()?.parent;

      if (column?.name === 'column') {
        if (paragraph?.isEmpty && column.childCount <= 1) {
          writer.remove(column);
        } else {
          console.log('Column is not empty. Cannot remove.');
        }
      }
    });
  }
}

class InsertLayoutCommand extends Command {
  override execute() {
    const editor = this.editor;
    const model = editor.model;

    return model.change(writer => {
      const simpleBox = writer.createElement('layout');
      const column1 = writer.createElement('column');
      const column2 = writer.createElement('column');
      const column3 = writer.createElement('column');

      writer.append(column1, simpleBox);
      writer.append(column2, simpleBox);
      writer.append(column3, simpleBox);

      writer.appendElement('paragraph', column1);
      writer.appendElement('paragraph', column2);
      writer.appendElement('paragraph', column3);
      editor.model.insertObject(simpleBox);
    });
  }
}

class LayoutManagerEditing extends Plugin {
  static get requires() {
    return [Widget];
  }

  init() {
    const editor = this.editor;

    editor.model.schema.register('layout', {
      isObject: true,
      allowWhere: '$block',
      allowContentOf: '$root',
      allowAttributes: ['class'],
    });

    editor.model.schema.register('column', {
      isLimit: true,
      allowIn: 'layout',
      allowContentOf: '$root',
      allowAttributes: ['class'],
    });

    editor.conversion.for('upcast').elementToElement({
      view: {
        name: 'div',
        classes: ['ck-columns'],
      },
      model: 'layout',
    });

    editor.conversion.for('dataDowncast').elementToElement({
      view: {
        name: 'div',
        classes: ['ck-columns'],
      },
      model: 'layout',
    });

    editor.conversion.for('upcast').elementToElement({
      view: {
        name: 'div',
        classes: ['ck-column'],
      },
      model: 'column',
    });

    editor.conversion.for('dataDowncast').elementToElement({
      view: {
        name: 'div',
        classes: ['ck-column'],
      },
      model: 'column',
    });

    editor.conversion.for('editingDowncast').elementToElement({
      model: 'layout',
      view: (_modelElement, viewWriter) => {
        const container = viewWriter.writer.createContainerElement('div', { class: 'ck-columns' });
        return toWidget(container, viewWriter.writer, { label: 'custom block widget' });
      },
    });

    editor.conversion.for('editingDowncast').elementToElement({
      model: 'column',
      view: (_modelElement, viewWriter) => {
        const column = viewWriter.writer.createEditableElement('paragraph', { class: 'ck-column' });
        return toWidgetEditable(column, viewWriter.writer);
      },
    });
  }
}

export default class LayoutManager extends Plugin {
  static get requires() {
    return [LayoutManagerEditing];
  }

  init() {
    const editor = this.editor;

    editor.ui.componentFactory.add('insertLayout', locale => {
      const view = new ButtonView(locale);
      view.set({
        label: 'Insert Layout',
        tooltip: true,
        icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M5 4C4.44772 4 4 4.44772 4 5V19C4 19.5523 4.44771 20 5 20H8V4H5ZM5 2C3.34315 2 2 3.34315 2 5V19C2 20.6569 3.34315 22 5 22H19C20.6569 22 22 20.6569 22 19V5C22 3.34315 20.6569 2 19 2H5ZM10 4V20H14V4H10ZM16 4V20H19C19.5523 20 20 19.5523 20 19V5C20 4.44771 19.5523 4 19 4H16Z" />
        </svg>
        `,
      });

      view.on('execute', () => {
        editor.execute('insertLayout');
        editor.editing.view.focus();
      });

      return view;
    });

    editor.ui.componentFactory.add('addColumn', locale => {
      const view = new ButtonView(locale);
      view.set({
        label: 'Add Column',
        withText: true,
        tooltip: true,
      });

      view.on('execute', () => {
        editor.execute('addColumn');
        editor.editing.view.focus();
      });

      return view;
    });

    editor.commands.add('insertLayout', new InsertLayoutCommand(editor));
    editor.commands.add('addColumn', new AddColumnCommand(editor));
    editor.commands.add('removeColumn', new RemoveColumnCommand(editor));

    // Listen to the Enter key and execute the command
    editor.keystrokes.set('shift+enter', (data, cancel) => {
      editor.execute('addColumn');
      cancel();
    });

    // Listen to the Backspace key and remove empty paragraphs
    editor.keystrokes.set('Backspace', (data, cancel) => {
      editor.execute('removeColumn');
    });
  }
}
