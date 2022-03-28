const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const delBtns = document.querySelectorAll(".deleteCommentBtn");

const addComment = (text)=>{
  const videoComments = document.querySelector(".video__comments ul");
  const newComment = document.createElement("li");
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
const deleteCom = (event)=>{
  let li=event.target.parentElement;
  console.log(li);
  li.remove();
  li="";
}
const handleSubmit = async(event) => {
  event.preventDefault();
  const textarea = form.querySelector("textarea");
  const text = textarea.value;
  const videoId = videoContainer.dataset.id;
  if(text===""){
      return;
  }
  const {status} = await fetch(`/api/videos/${videoId}/comment`,{
      method:"POST",
      headers:{
        "Content-Type":"application/json",
      },
      body:JSON.stringify({text}),
  });
  textarea.value="";
  if(status=== 201){
    addComment(text);
  }
};
if(form){
    form.addEventListener("submit", handleSubmit);
}

for(let i=0;i<delBtns.length;i++){
  delBtns[i].addEventListener("click",deleteCom);
}