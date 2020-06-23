class NavbarMaster extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
    <div>
<h1>TEST</h1>
  </div>
    );
  }
}


const domContainer = document.getElementById("navbar_container");
ReactDOM.render(<NavbarMaster />, domContainer);
