
const api = window.ModuleApi;
const React = api.React;
const ReactBootstrap = api.ReactBootstrap;
const Markdown = require('react-remarkable');
const style = require('../css/style');

class TranslationWordsDisplay extends React.Component {
    convertToMarkdown(src) {
        return src.replace(/(=+)([^=]+)\1/g, function(match, equals, header) {
            switch(equals.length) {
                case 6:
                    return "##" + header;
                case 5:
                    return "####" + header;
                default:
                    return "#####" + header;
            }
        });
    }

    render() {
        var source = this.props.currentFile;
        if (source) {
            return (
                <div style={style.translationHelpsContent}>
                    <div>
                        <Markdown source={this.convertToMarkdown(source)} />
                    </div>
                </div>
            );
        }
        else {
            console.error('Source for TranslationWordsDisplay is undefined');
            return (<div></div>);
        }
    }
}

module.exports = TranslationWordsDisplay;
