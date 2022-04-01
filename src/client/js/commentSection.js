const videoContainer = document.getElementById("videoContainer");
const video__comment = document.querySelector(".video__comment");
const commentContainer = document.getElementById("commentContainer");
const form = document.getElementById("commentForm");
const delBtns = document.querySelectorAll(".deleteCommentBtn");

const addComment = (text,id)=>{
  const videoComments = document.querySelector(".video__comments ul");
  const newComment = document.createElement("li");
  newComment.dataset.id = id;
  newComment.className = "video__comment";
  const icon = document.createElement("i");
  icon.className = "fas fa-comment";
  const span = document.createElement("span");
  const delBtn = document.createElement("span");
  span.innerText = ` ${text}`;
  delBtn.innerText = '❌';
  newComment.appendChild(icon);
  newComment.appendChild(span);
  newComment.appendChild(delBtn);
  videoComments.prepend(newComment);
}
const deleteCom = async(event)=>{
const commentId = video__comment.dataset.commentid;

 const {status} = await fetch(`/api/videos/comment/${commentId}/delete`,{
      method:"DELETE"
  });
  if(status==201){
    const li=event.target.parentElement;
    li.remove();
}
  
}
const handleSubmit = async(event) => {
  event.preventDefault();
  const textarea = form.querySelector("textarea");
  const text = textarea.value;
  const videoId = videoContainer.dataset.videoid;
  if(text===""){
      return;
  }
  const response = await fetch(`/api/videos/${videoId}/comment`,{
      method:"POST",
      headers:{
        "Content-Type":"application/json",
      },
      body:JSON.stringify({text}),
  });
  if(response.status=== 201){
    textarea.value="";
    const {newCommentId} = await response.json();
    addComment(text,newCommentId);

  }
};
if(form){
    form.addEventListener("submit", handleSubmit);
}

for(let i=0;i<delBtns.length;i++){
  delBtns[i].addEventListener("click",deleteCom);
}