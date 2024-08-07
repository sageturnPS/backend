import { useNavigate } from 'react-router-dom'

const BackButton = () => {
  const navigate = useNavigate()

  return (
    <button
      className="ml-10 mt-10 bg-transparent text-xl text-black"
      onClick={() => navigate(-1)}
    >
      <div className="flex h-10 w-20 content-center items-center justify-center align-middle">
        <img src="/assets/back.png" className="h-3/4" />
        Back
      </div>
    </button>
  )
}

export default BackButton
