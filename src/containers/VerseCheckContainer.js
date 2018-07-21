import React from 'react';
import usfmjs from 'usfm-js';
import isEqual from 'deep-equal';
import {optimizeSelections, normalizeString} from '../helpers/selectionHelpers';
import * as checkAreaHelpers from '../helpers/checkAreaHelpers';
import {VerseCheck} from 'tc-ui-toolkit';

class VerseCheckContainer extends React.Component {
  constructor(props) {
    super(props);

    let verseText = usfmjs.removeMarker(this.verseText());
    const mode = props.selectionsReducer &&
      props.selectionsReducer.selections &&
      props.selectionsReducer.selections.length > 0 || verseText.length === 0 ? 'default' : 'select';

    this.state = {
      mode: mode,
      comment: undefined,
      commentChanged: false,
      verseText: undefined,
      verseChanged: false,
      selections: [],
      tags: [],
      dialogModalVisibility: false,
      goToNextOrPrevious: null,
    };
    this.verseText = this.verseText.bind(this);
    this.saveSelection = this.saveSelection.bind(this);
    this.cancelSelection = this.cancelSelection.bind(this);
    this.clearSelection = this.clearSelection.bind(this);
    this.handleSkip = this.handleSkip.bind(this);
    this.findIfVerseEdited = this.findIfVerseEdited.bind(this);
    this.findIfVerseInvalidated = this.findIfVerseInvalidated.bind(this);

    //TODO: factor out actions object to individual functions
    //Will require changes to the ui kit
    const _this = this;
    this.actions = {
      handleGoToNext() {
        if (!_this.props.loginReducer.loggedInUser) {
          _this.props.actions.selectModalTab(1, 1, true);
          _this.props.actions.openAlertDialog("You must be logged in to save progress");
          return;
        }
        props.actions.goToNext();
      },
      handleGoToPrevious() {
        if (!_this.props.loginReducer.loggedInUser) {
          _this.props.actions.selectModalTab(1, 1, true);
          _this.props.actions.openAlertDialog("You must be logged in to save progress");
          return;
        }
        props.actions.goToPrevious();
      },
      handleOpenDialog(goToNextOrPrevious) {
        _this.setState({goToNextOrPrevious});
        _this.setState({dialogModalVisibility: true});
      },
      handleCloseDialog() {
        _this.setState({dialogModalVisibility: false});
      },
      skipToNext() {
        _this.setState({dialogModalVisibility: false});
        props.actions.goToNext();
      },
      skipToPrevious() {
        _this.setState({dialogModalVisibility: false});
        props.actions.goToPrevious();
      },
      changeSelectionsInLocalState(selections) {
        _this.setState({selections});
      },
      changeMode(mode) {
        _this.setState({
          mode: mode,
          selections: _this.props.selectionsReducer.selections
        });
      },
      handleComment(e) {
        const comment = e.target.value;
        _this.setState({
          comment: comment
        });
      },
      checkComment(e) {
        const newcomment = e.target.value || "";
        const oldcomment = _this.props.commentsReducer.text || "";
        _this.setState({
          commentChanged: newcomment !== oldcomment
        });
      },
      cancelComment() {
        _this.setState({
          mode: 'default',
          selections: _this.props.selectionsReducer.selections,
          comment: undefined,
          commentChanged: false
        });
      },
      saveComment() {
        if (!_this.props.loginReducer.loggedInUser) {
          _this.props.actions.selectModalTab(1, 1, true);
          _this.props.actions.openAlertDialog("You must be logged in to leave a comment", 5);
          return;
        }
        _this.props.actions.addComment(_this.state.comment, _this.props.loginReducer.userdata.username);
        _this.setState({
          mode: 'default',
          selections: _this.props.selectionsReducer.selections,
          comment: undefined,
          commentChanged: false
        });
      },
      handleTagsCheckbox(tag) {
        let newState = _this.state;
        if (newState.tags === undefined) newState.tags = [];
        if (!newState.tags.includes(tag)) {
          newState.tags.push(tag);
        } else {
          newState.tags = newState.tags.filter(_tag => _tag !== tag);
        }
        _this.setState(newState);
      },
      handleEditVerse(e) {
        const verseText = e.target.value;
        _this.setState({
          verseText: verseText
        });
      },
      checkVerse(e) {
        let {chapter, verse} = _this.props.contextIdReducer.contextId.reference;
        const newverse = e.target.value || "";
        const oldverse = _this.props.resourcesReducer.bibles.targetLanguage.targetBible[chapter][verse] || "";
        if (newverse === oldverse) {
          _this.setState({
            verseChanged: false,
            tags: []
          });
        } else {
          _this.setState({
            verseChanged: true
          });
        }
      },
      cancelEditVerse() {
        _this.setState({
          mode: 'default',
          selections: _this.props.selectionsReducer.selections,
          verseText: undefined,
          verseChanged: false,
          tags: []
        });
      },
      saveEditVerse() {
        let {loginReducer, actions, contextIdReducer, resourcesReducer} = _this.props;
        let {chapter, verse} = contextIdReducer.contextId.reference;
        let before = resourcesReducer.bibles.targetLanguage.targetBible[chapter][verse];
        let username = loginReducer.userdata.username;
        // verseText state is undefined if no changes are made in the text box.
        if (!loginReducer.loggedInUser) {
          _this.props.actions.selectModalTab(1, 1, true);
          _this.props.actions.openAlertDialog("You must be logged in to edit a verse");
          return;
        }

        const save = () => {
          actions.editTargetVerse(chapter, verse, before, _this.state.verseText, _this.state.tags, username);
          _this.setState({
            mode: 'default',
            selections: _this.props.selectionsReducer.selections,
            verseText: undefined,
            verseChanged: false,
            tags: []
          });
        };
        if (_this.state.verseText) {  // if verseText === "" is false
          save();
        } else {
          // alert the user if the text is blank
          let message = 'You are saving a blank verse. Please confirm.';
          _this.props.actions.openOptionDialog(message, (option) => {
            if (option !== "Cancel") save();
            _this.props.actions.closeAlertDialog();
          }, "Save Blank Verse", "Cancel");
        }
      },
      validateSelections(verseText) {
        _this.props.actions.validateSelections(verseText);
      },
      toggleReminder() {
        _this.props.actions.toggleReminder(_this.props.loginReducer.userdata.username);
      },
      openAlertDialog(message) {
        _this.props.actions.openAlertDialog(message);
      },
      selectModalTab(tab, section, vis) {
        _this.props.actions.selectModalTab(tab, section, vis);
      }
    };
  }

  componentWillMount() {
    let selections = [...this.props.selectionsReducer.selections];
    this.setState({selections});
  }

  componentWillReceiveProps(nextProps) {
    const {contextIdReducer, resourcesReducer} = this.props || {};
    const nextContextIDReducer = nextProps.contextIdReducer;
    if (contextIdReducer !== nextContextIDReducer) {
      let selections = Array.from(nextProps.selectionsReducer.selections);
      const {chapter, verse} = nextContextIDReducer.contextId.reference || {};
      const {targetBible} = nextProps.resourcesReducer.bibles.targetLanguage || {};
      let verseText = targetBible && targetBible[chapter] ? targetBible[chapter][verse] : "";
      if (Array.isArray(verseText)) verseText = verseText[0];
      // normalize whitespace in case selection has contiguous whitespace _this isn't captured
      verseText = normalizeString(verseText);
      const mode = nextProps.selectionsReducer.selections.length > 0 || verseText.length === 0 ? 'default' : 'select';
      this.setState({
        mode: mode,
        comments: undefined,
        verseText: undefined,
        selections,
        tags: []
      });
    }
  }

  verseText() {
    let verseText = "";
    if (this.props.contextIdReducer && this.props.contextIdReducer.contextId) {
      const {chapter, verse, bookId} = this.props.contextIdReducer.contextId.reference;
      const bookAbbr = this.props.projectDetailsReducer.manifest.project.id;
      const {targetBible} = this.props.resourcesReducer.bibles.targetLanguage;
      if (targetBible && targetBible[chapter] && bookId == bookAbbr) {
        verseText = targetBible && targetBible[chapter] ? targetBible[chapter][verse] : "";
        if (Array.isArray(verseText)) verseText = verseText[0];
        // normalize whitespace in case selection has contiguous whitespace _this isn't captured
        verseText = normalizeString(verseText);
      }
    }
    return verseText;
  }


  cancelSelection() {
    this.actions.changeSelectionsInLocalState(this.props.selectionsReducer.selections);
    this.actions.changeMode('default');
  }

  clearSelection() {
    this.setState({
      selections: []
    });
  }

  saveSelection() {
    let verseText = this.verseText();
    // optimize the selections to address potential issues and save
    let selections = optimizeSelections(verseText, this.state.selections);
    this.props.actions.changeSelections(selections, this.props.loginReducer.userdata.username);
    this.actions.changeMode('default');
  }

  /**
   * returns true if current verse has been edited
   * @return {boolean}
   */
  findIfVerseEdited() {
    const groupItem = this.getGroupDatumForCurrentContext();
    return !!(groupItem && groupItem.verseEdits);
  }

  /**
   * returns true if current verse has been invalidated
   * @return {boolean}
   */
  findIfVerseInvalidated() {
    const groupItem = this.getGroupDatumForCurrentContext();
    return !!(groupItem && groupItem.invalidated);
  }

  /**
   * finds group data for current context (verse)
   * @return {*}
   */
  getGroupDatumForCurrentContext() {
    const {contextIdReducer: {contextId}, groupsDataReducer: {groupsData}} = this.props;
    let groupItem = null;
    if (groupsData[contextId.groupId]) {
      groupItem = groupsData[contextId.groupId].find(groupData => {
        return isEqual(groupData.contextId, contextId);
      });
    }
    return groupItem;
  }

  handleSkip(e) {
    e.preventDefault();
    if (this.state.goToNextOrPrevious == "next") {
      this.actions.skipToNext();
    } else if (this.state.goToNextOrPrevious == "previous") {
      this.actions.skipToPrevious();
    }
  }

  getAlignedGLText(currentProjectToolsSelectedGL, contextId, bibles, currentToolName) {
    //debugger;
    let alignedGLText = contextId.quote;
    const selectedGL = currentProjectToolsSelectedGL[currentToolName];

  // Some resources have the old translation type. The following code
  // allows for current and previous types
    let translationType = 'ult'; // unfoldingword literal text replaces
    const oldType = 'ulb';       // unlocked literal bible

    if (bibles[selectedGL] && (bibles[selectedGL][translationType] || bibles[selectedGL][oldType])) {
      if (bibles[selectedGL][oldType]) {
        translationType = oldType;
      }

      const verseObjects = bibles[selectedGL][translationType][contextId.reference.chapter][contextId.reference.verse].verseObjects;
      const wordsToMatch = contextId.quote.split(' ');
      const alignedText = checkAreaHelpers.getAlignedText(verseObjects, wordsToMatch, contextId.occurrence);
      if (alignedText) {
        alignedGLText = alignedText;
      }
    }

    return alignedGLText;
  }

  render() {
    const {
      translate,
      currentToolName,
      projectDetailsReducer: {currentProjectToolsSelectedGL, manifest, projectSaveLocation},
      loginReducer,
      selectionsReducer: {selections},
      contextIdReducer: {contextId},
      resourcesReducer,
      commentsReducer,
      toolsReducer,
      groupsDataReducer,
      remindersReducer
    } = this.props;
    const verseText = usfmjs.removeMarker(this.verseText());
    const alignedGLText = this.getAlignedGLText(
      currentProjectToolsSelectedGL, contextId, resourcesReducer.bibles, currentToolName);
    return (
      <VerseCheck
        translate={translate}
        commentsReducer={commentsReducer}
        remindersReducer={remindersReducer}
        projectDetailsReducer={{currentProjectToolsSelectedGL, manifest, projectSaveLocation}}
        contextIdReducer={{contextId}}
        resourcesReducer={resourcesReducer}
        selectionsReducer={{selections}}
        loginReducer={loginReducer}
        toolsReducer={toolsReducer}
        groupsDataReducer={groupsDataReducer}
        alignedGLText={alignedGLText}
        verseText={verseText}
        mode={this.state.mode}
        actions={this.actions}
        dialogModalVisibility={this.state.dialogModalVisibility}
        commentChanged={this.state.commentChanged}
        findIfVerseEdited={this.findIfVerseEdited}
        findIfVerseInvalidated={this.findIfVerseInvalidated}
        tags={this.state.tags}
        verseChanged={this.state.verseChanged}
        selections={this.state.selections}
        saveSelection={this.saveSelection}
        cancelSelection={this.cancelSelection}
        clearSelection={this.clearSelection}
        handleSkip={this.handleSkip} />
    );
  }
}

export default VerseCheckContainer;