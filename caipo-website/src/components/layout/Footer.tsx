

export default function Footer () {
    const currentYear = new Date().getFullYear();
    return (
        <footer className=" border-t border-slate-200 text-slate-600">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          
          
          <div className="flex flex-col items-center md:items-start">
            <h2 className="text-xl font-bold text-white tracking-tight">
              CAIPO<span className="text-blue-600">.</span>
            </h2>
            <p className="mt-2 text-white text-sm text-center md:text-left max-w-xs">
              Building the future.
            </p>
          </div>

         
        </div>

        <div className="h-px bg-slate-200 w-full my-8" />

        <div className="flex flex-col text-gray-400 md:flex-row justify-end items-center text-xs uppercase tracking-wider font-medium">
          <p>
            © {currentYear} Caipo. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
    )
}