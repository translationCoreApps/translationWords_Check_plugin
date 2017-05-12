var style = {
  translationHelpsContent: {
    overflowY: "scroll",
    minWidth: "100%",
    padding: '9px',
    minHeight: "390px",
    maxHeight: "390px",
    backgroundColor: "#c4c4c4"
  },
  buttonGlyphicons:{
    color: "#FFFFFF",
    fontSize: "20px"
  },
  tHelpsOpen:{
    float: "left",
    marginTop: "50vh",
    zIndex: "999",
    color: "#fff",
    backgroundColor: "#000",
    padding: "10px 0px",
    marginLeft: "-15px",
    borderRadius: "5px 0px 0px 5px"
  },
  tHelpsClosed:{
    float: "right",
    marginTop: "50vh",
    zIndex: "999",
    color: "#fff",
    backgroundColor: "#000",
    padding: "10px 0px",
    marginLeft: "-15px",
    borderRadius: "5px 0px 0px 5px"
  },
  linkActive: {
    fontWeight: 'bold',
    display: 'flex',
    justifyContent: 'flex-end',
    margin: '10px 20px',
    cursor: 'pointer'
  },
  linkInactive: {
    fontWeight: 'bold',
    color: 'var(--accent-color-dark)',
    margin: '10px 20px',
    textAlign: 'right',
    cursor: 'default'
  },
  checkInfo: {
    flex: '0 0 100px',
    display: 'flex',
    margin: '10px',
    color: 'var(--reverse-color)',
    backgroundColor: 'var(--accent-color-dark)',
    boxShadow: '0 3px 10px var(--background-color)',
    borderRadius: '2px',
  },
  leftSide: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  rightSide: {
    flex: 2,
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
    justifyContent: 'space-between',
    borderLeft: '1px solid var(--reverse-color)',
  },
};

module.exports = style;
