/**
 * @description:
 *  This class defines the entire view for TranslationWords tool
 */
import React from 'react';
import {Row, Col, Tabs, Tab, Glyphicon} from 'react-bootstrap';
import CheckInfoCard from './components/CheckInfoCard.js';
import style from './css/style';

class View extends React.Component {

  render() {
    // Modules not defined within translationWords
    const {
      ScripturePane,
      VerseCheck,
      TranslationHelps
    } = this.props.modules;

    // set the scripturePane to empty to handle react/redux when it first renders without required data
    let scripturePane = <div></div>;
    // populate scripturePane so that when required data is preset that it renders as intended.
    if (this.props.modulesSettingsReducer.ScripturePane !== undefined) {
      scripturePane = <ScripturePane {...this.props} />
    }

    return (
        <div style={{display: 'flex', flex: 'auto'}}>
          <div style={{flex: 3, display: "flex", flexDirection: "column"}}>
            {scripturePane}
            <CheckInfoCard openHelps={this.props.toggleHelps} showHelps={this.props.showHelps} title={this.props.contextIdReducer.contextId.quote} file={this.props.currentFile}/>
            <VerseCheck
              {...this.props}
              goToNext={this.props.goToNext}
              goToPrevious={this.props.goToPrevious}
            />
          </div>
          <div style={{flex: 1}}>
            <div style={{height: "100vh"}}>
              <Glyphicon glyph={this.props.showHelps ? "chevron-right" : "chevron-left"}
                         style={this.props.showHelps ? style.tHelpsOpen : style.tHelpsClosed}
                         onClick={this.props.toggleHelps} />
                <div style={{display: this.props.showHelps ? "block" : "none", height: "100vh"}}>
                  <TranslationHelps {...this.props} currentFile={this.props.currentFile}
                                  online={this.props.statusBarReducer.online}/>
                </div>
            </div>
          </div>
        </div>
    );
  }
}

module.exports = View;
