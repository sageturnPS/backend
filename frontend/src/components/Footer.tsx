const Footer = () => {
  return (
    <div className="flex h-40 w-screen flex-row justify-evenly border-t-2 border-black/40 pl-6 text-left text-sm">
      {/* Image */}
      <div className="flex items-center">
        <img
          src="/assets/PS_Logo.svg"
          alt="Publicis Sapient Logo"
          className="mr-10 h-28"
        />
      </div>
      {/* Column 1 */}
      <div className="flex flex-col pt-6">
        <h3 className="mb-2 text-left font-medium text-footerheadergray">
          Publicis Sapient Summer 2024 Interns, Chicago Retail Team
        </h3>
        <h3 className="font-normal text-footeritemgray">
          Albertsons Companies Inc.
        </h3>
        <div></div>
      </div>
      {/* Column 2 */}
      <div className="flex flex-col pt-6">
        <h3 className="mb-2 font-medium text-footerheadergray">Team Members</h3>

        <div className="flex flex-col">
          <div className="flex flex-row gap-12">
            <div>
              <h3 className="font-medium text-footerheadergray">Engineering</h3>
              <div className="flex flex-row gap-4 text-left font-normal text-footeritemgray">
                <div>
                  <p>Annika Cruz</p>
                  <p>Jenny Lin</p>
                  <p>Lia Jacobs</p>
                </div>
                <div>
                  <p>Sage Turner</p>
                  <p>Sanju Kanumuri</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-footerheadergray">
                Product Management
              </h3>
              <div className="font-normal text-footeritemgray">
                <p>Dominique Jordan</p>
                <p>Ojas Padalkar</p>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-footerheadergray">People Ops</h3>

              <div className="font-medium text-footeritemgray">
                <p>Emily Reiche</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <h3 className="font-semibold"></h3>
    </div>
  )
}

export default Footer
