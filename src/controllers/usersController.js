import bcrypt from "bcrypt";
import User from "../models/User";
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
    const baseUrl ="https://github.com/login/oauth/authorize";
    const config = {
        client_id : process.env.GH_CLIENT,
        allow_signup:false,
        scope: "read:user user:email",
    };
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    return res.redirect(finalUrl);
};
export const finishGithubLogin = async(req,res) =>{
    const baseUrl = "https://github.com/login/oauth/access_token";
    const config = {
        client_id: process.env.GH_CLIENT,
        client_secret: process.env.GH_SECRET,
        code: req.query.code,
    }
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    const tokenRequest = await(await fetch(finalUrl,{
        method:"POST",
        headers: {
            Accept: "application/json",
        },
    })
    ).json();
    if("access_token" in tokenRequest){
        const {access_token } = tokenRequest;
        const apiUrl = "https://api.github.com";
        const userData = await(
            await fetch(`${apiUrl}/user`,{
            headers: {
                Authorization: `token ${access_token}`,
            },
        })
        ).json();
        console.log(userData);
        const emailData = await(
            await fetch(`${apiUrl}/user/emails`,{
                headers:{
                    Authorization: `token ${access_token}`,
                },
            })
            ).json();
        const emailObj = emailData.find(
            (email) => email.primary === true && email.verified === true);
        if(!emailObj){
            //set notification
            return res.redirect("/login");
        }
        let user =  await User.findOne({email: emailObj.email});
        if(!user){
            const user = await User.create({
                name:userData.name,
                avatarUrl:userData.avatar_url,
                username:userData.login, 
                email:emailObj.email, 
                password:"",
                socialOnly:true,
                location:userData.location,
            });
            req.session.loggedIn= true;
            req.session.user = user;
            return res.redirect("/");
        }
        req.session.loggedIn= true;
        req.session.user = user;
        return res.redirect("/");
    }else {
        return res.redirect("/login");
    }
    
};
export const getEdit = (req,res) => {
     return res.render("edit-profile",{pageTitle:"Edit Profile",user:req.session.user});
};
export const postEdit = async(req,res) =>{
    const { 
        session:  {
            user: {_id},
            
            }, 
           body: { email, username, name, location}, 
        } = req;
    const logInUsername = req.session.user.username;
    const logInEmail = req.session.user.email;
    const exists = User.exists({$or: [{email},{username}]});
    if((exists&&username!=logInUsername)||(exists&&email!=logInEmail)){
        return res.status(400).render("edit-profile",
        {pageTitle: "Edit Profile"
        ,errorMessage: "This is email/username Already taken.",
    });
    }
    const updateUser = await User.findByIdAndUpdate(_id,{
            name,
            email,
            username,
            location,
        },
        {new : true});
        req.session.user = updateUser;
    return res.redirect("/users/edit");
};
export const logout = (req,res) => {
    req.session.destroy();
    return res.redirect("/");
};
export const see = (req,res) => res.send("see User");