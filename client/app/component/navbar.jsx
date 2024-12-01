// Add this at the top to specify that this is a client-side component
"use client"; 


export default function Navbar({ variable1, variable2, link1, link2 }) {

  return (
    <div className="h-[80px] bg-slate-200 flex shadow-md mb-10">
      <div className="w-[55%] h-full flex ml-10 items-center text-3xl font-semibold">
        Company Name
      </div>

      <div className="w-[40%] h-full flex justify-evenly items-center">
        <button className="w-[100px] h-[35px] rounded bg-white flex justify-center items-center hover:bg-black hover:text-white" onClick={()=>{
          window.location.href =`${link1}`
        }}>
          {variable1}
        </button>
        <button className="w-[100px] h-[35px] rounded bg-white flex justify-center items-center hover:bg-black hover:text-white" onClick={()=>{
          window.location.href =`${link2}`
        }}>
          {variable2}
        </button>
        <button
          className="w-[100px] h-[35px] rounded bg-white flex justify-center items-center hover:bg-black hover:text-white"
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/";  // Redirect to homepage after logout
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
