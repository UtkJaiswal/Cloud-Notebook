import React, { useContext } from "react";
import noteContext from "../context/notes/noteContext";

function Noteitem(props) {
  const context = useContext(noteContext);
  const {deleteNote} = context;
  const { note,updateNote } = props;

  return (
    <div className="col-md-3">
      <div className="card my-3">
        <div className="card-body">
          <div className="d-flex align-items-center">

          <h5 className="card-title">{note.title}</h5>
          <i className="fa fa-trash mx-1" onClick={()=>{deleteNote(note._id);
          props.showAlert("Deleted successfully", "success")}}></i>
          <i className="fas fa-edit mx-1" onClick={()=>{updateNote(note);
          props.showAlert("Updated successfully", "success")}}></i>
          </div>
          <p className="card-text">
          {note.description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Noteitem;
