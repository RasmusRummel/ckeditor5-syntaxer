# ckeditor5-syntaxer

ckeditor5-syntaxer is a 3. party free code syntaxer for CKEditor 5.

<br /><br />ckeditor5-syntaxer is just a wrapper to be used together with a syntaxing library like HighlightJs. ckeditor5-syntaxer wraps a block of code and set the language as a class on that wrapper - it is then the responsibility of the syntaxing library to do the actually syntaxing based on the language class :



Full ckeditor5-syntaxer official documentation here : [CKPopover - a CKEditor 5 plugin](https://topiqs.online/1122).
<br />The full documentation also contains step-by-step creation of the editor.
<br />Below is a short usage documentation. 

//#1 : In your CKEditor5 build file ADD a reference to ckeditor5-syntaxer:

```javaqscript
// app.js

import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import Syntaxer from 'ckeditor5-syntaxer'; // ADD THIS
// ...

ClassicEditor.builtinPlugins = [
    Essentials,
    Autoformat,
    Bold,
    Italic,
    BlockQuote,
    Image,
    ImageUpload,
    Syntaxer // ADD THIS
    // ...
]
```

<br />//#2 : Then creating the CKEditor5 set the SyntaxerPlugin languages (optional) :

```javaqscript
ClassicEditor.create(document.querySelector('#editor'), {
    syntaxer: {
        languages: ['c#', 'php', 'java', 'sql', 'javascript', 'json', 'xml', 'html', 'css', 'markdown'], // optional
		element: 'pre' // optional - the wrapping element is default a 'pre', however you can set this to eg. 'div' if you prefer
    }
        // ...
});
```
<br />//#3 : In the page that consumes the result of your CKEditor5, make a reference to a syntaxing library, here HighlightJs, in the header of that page :
```html
<html>
    <head>
	    <link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.15.6/styles/default.min.css">
	    <script src="//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.15.6/highlight.min.js"></script>
		// ...
	</head>
	<body>
	    // ...
	</body>
</html>
```

<br />//#4 : In the page that consumes the result of your CKEditor5, call the syntaxer function of your syntaxer library, here shown for HighlightJs :
```javascript
document.addEventListener("DOMContentLoaded", () => {
	var codeBlocks = document.querySelectorAll("pre.code"); // default element (pre) and class distinguisher (code) used by ckeditor5-syntaxer
	codeBlocks.forEach((codeBlock) => {
		hljs.highlightBlock(codeBlock);
	});
}
```
