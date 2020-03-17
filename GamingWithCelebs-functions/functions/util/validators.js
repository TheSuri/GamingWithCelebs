const isEmail = (string) => {
    const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(string.match(emailRegEx)) return true;
    return false;
}

exports.isEmpty = (data) => {
    if (typeof data == "undefined") return true;
    if (Array.isArray(data) && data.length > 0)return true;
    if (typeof data == "string" && data.trim() === '') return true;
      return false;
} 

exports.validateSignupData = (data) => {
    let errors = {};
    if(this.isEmpty(data.email)){
      errors.email = 'Must not be empty';
    } 
    else if(!isEmail(data.email)){
      errors.email = 'Must be a valid email';
    }
    if(this.isEmpty(data.password)) errors.password = 'Must not be empty';
    if(data.password !== data.confirmPassword) errors.confirmPassword = 'Passwords must match';
    if(this.isEmpty(data.handle)) errors.handle = 'Must not be empty';
    
    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    }
}

exports.validateLoginData = (data) => {
    let errors = {};
    if(this.isEmpty(data.email)) errors.email = "must not be empty";
    if(this.isEmpty(data.password)) errors.password = "must not be empty";
    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    }
}

exports.validateCelebrityData = (data) => {
  let errors = {};
  if(this.isEmpty(data.categories)) errors.categories = "must not be empty";
  return {
      errors,
      valid: Object.keys(errors).length === 0 ? true : false
  }
}


// exports.reduceUserDetails = (data) => {
//   let userDetails = {};
//   if(!isEmpty(data.bio.trim())) userDetails.bio = data.bio;
//   if(!isEmpty)
// }
  