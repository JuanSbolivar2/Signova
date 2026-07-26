import {
auth,
createUserWithEmailAndPassword
} from "./firebase.js";

window.registrar = async function(){

const nombre=document.getElementById("reg-nombre").value.trim();

const correo=document.getElementById("reg-correo").value.trim();

const pass=document.getElementById("reg-pass").value;

const confirmar=document.getElementById("reg-confirmar").value;

if(pass!=confirmar){

alert("Las contraseñas no coinciden");

return;

}

try{

const user=await createUserWithEmailAndPassword(auth,correo,pass);

alert("Cuenta creada");

console.log(user.user.uid);

}catch(e){

alert(e.message);

}

}
