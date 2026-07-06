export const handleForm = (cb) => (e) => {

    e.preventDefault();
    const formData = new FormData(e.target)
    const data = Object.fromEntries(formData.entries());
    cb(data);
    
}