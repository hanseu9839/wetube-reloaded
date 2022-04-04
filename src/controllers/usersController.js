import bcrypt from "bcrypt";
import User from "../models/User";
import Video from "../models/Video";
import fetch from "node-fetch";
export const getJoin = (req,res) => res.render("join",{
    pageTitle: "Join"
});
export const postJoin=async(req,res)=>{
   const {name, username, email, password,password2, location} =  req.body;
   const pageTitle = "Join";
    if(password !== password2){
        return res.status(400).render("join",{
            pageTitle,
            errorMessage: "Password confirmation does not match.",
        });
    }
    const exists = await User.exists({$or:[{username},{email}]});
    if(exists){
        return res.status(400).render("join",{ pageTitle,
       errorMessage:"This username/email is already taken.",
    });
    }
try{
   await User.create({
    name, 
    username, 
    email, 
    password,
    location,
   });
} catch(error){
    return res.status(400).render("join",{
        pageTitle: "Join",
        errorMessage: error._message,
    });
}
   return res.redirect("/login");
};
export const getLogin = (req,res) => res.render("login",{pageTitle:"Login"});
export const postLogin = async(req,res)=> {
    const {username, password} = req.body;
    const user = await User.findOne({username,socialOnly: false});
    if(!user){
        return res.status(400).render("login",{
            pageTitle: "Login", 
            errorMessage: "An account with this username does not exists.",
        });
    }
    const ok = await bcrypt.compare(password, user.password);
    if(!ok){
        return res.status(400).render("login",{
            pageTitle: "Login", 
            errorMessage: "Wrong password",
    });
    }
    req.session.loggedIn= true;
    req.session.user = user;
    return res.redirect("/");
};

export const startGithubLogin = (req,res) =>{
    const baseUrl = "https://github.com/login/oauth/authorize"
    const config = {
        client_id: process.env.GH_CLIENT,
        allow_signup: false,
        scope: "read:user user:email",
    };
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    return res.redirect(finalUrl);
};
export const finishGithubLogin = async(req,res) =>{
    const baseUrl = "https://github.com/login/oauth/access_token"

    const config = {
        client_id: process.env.GH_CLIENT,
        client_secret: process.env.GH_SECRET,
        code: req.query.code
    }
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`
    const tokenRequest = await (
        await fetch(finalUrl, {
            method: "POST",
            headers: {
                Accept: "application/json",
            },
        })
    ).json();
    if ("access_token" in tokenRequest) {
        const {
            access_token
        } = tokenRequest;
        const apiUrl = "https://api.github.com"
        const userData = await (await fetch(`${apiUrl}/user`, {
            headers: {
                Authorization: `token ${access_token}` //json에는 token이 있어서 access_token을 fetch
            }
        })).json();
        console.log(userData)
        const emailData = await (await fetch(`${apiUrl}/user/emails`, {
            headers: {
                Authorization: `token ${access_token}` //json에는 token이 있어서 access_token을 fetch
            },

        })).json();
        const emailObj = emailData.find(
            (email) => email.primary === true && email.verified === true);
        if (!emailObj) {
            return res.redirect("/login");
        }
        let user = await User.findOne({
            email: emailObj.email
        });
        if (!user) {
            //해당 이메일로 user가 없으니까 계정을 생성해라
            user = await User.create({
                avatarUrl: userData.avatar_url,
                name: userData.name ? userData.name : userData.login,
                username: userData.login,
                email: emailObj.email,
                password: "",
                socialOnly: true,
                location: userData.location,
            });
        }
        req.session.loggedIn = true;
        req.session.user = user;
        return res.redirect("/");
    } else {
        return res.redirect("/login");
    }  
};
export const getEdit = (req,res) => {
     return res.render("edit-profile",{pageTitle:"Edit Profile",user:req.session.user});
};
export const postEdit = async(req,res) =>{
    const {
        session: {
            user: { _id, avatarUrl, email: sessionEmail, username: sessionUsername },
        },
        body: { name, email, username, location },
        file
    } = req;

   
    let searchParam = [];
    if (sessionEmail !== email) {
        searchParam.push({ email });
    }
    if (sessionUsername !== username) {
        searchParam.push({ username });
    }
    if (searchParam.length > 0) {
        const foundUser = await User.findOne({ $or: searchParam });
        if (foundUser && foundUser._id.toString() !== _id) {
            return res.status(400).render("edit-profile", {
                pageTitle: "Edit Profile",
                errorMessage: "This username/email is already taken.",
            });
        }
    }
    const updatedUser = await User.findByIdAndUpdate(_id,{
        name:name, email:email, username:username, location:location,
        avatarUrl: file ? file.path : avatarUrl,
    },
    {new : true});
    req.session.user =  updatedUser;
    return res.redirect("/users/edit");
};
export const logout = (req, res) => {
    req.session.destroy();
    return res.redirect("/");
};
export const getChangePassword = (req,res) => {
    if(req.session.user.socialOnly === true){
        req.flash("eroor","Can't change password.");
        return res.redirect("/");
    }
    return res.render("users/change-password", {pageTitle: "Change Password"});
};
export const postChangePassword = async(req,res) =>{
    const { 
        session:  {
            user: {_id},            
            }, 
           body: { oldPassword, newPassword, newPasswordConfirmation,}, 
        } = req;
    
    const user =await User.findById(_id);
    const ok = await bcrypt.compare(oldPassword,user.password);
    if(!ok){
        return res.status(400).render("users/change-password", 
        {pageTitle: "Change Password"
        , errorMessage: "The current password is incorrect"});
    }
    if(newPassword!==newPasswordConfirmation){
        return res.status(400).render("users/change-password", {pageTitle: "Change Password", errorMessage: "The password does not match the confirmation"});
    }  
   user.password=newPassword;
   await user.save(); 
   req.flash("info","password updated");
   return res.redirect("/users/logout");
};
export const see = async(req,res) => {
    const {id}=req.params;
    const  user= await User.findById(id).populate({
        path: "videos",
        populate: {
            path:"owner",
            model: "User",
        },
    });
   
    if(!user){
        return res.status(404).render("404", {pageTitle:"User not found."});
    }
    
    return res.render("users/profile",{
        pageTitle:user.name, 
        user,      
    });
}