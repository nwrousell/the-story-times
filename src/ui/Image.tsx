export default function Image({ path, active=false, onClick=null }){
    return (
        <img onClick={onClick} src={path} className={`w-full h-auto ${active ? 'border-blue-600' : 'border-gray-200'} border-4 rounded-sm ${onClick && 'cursor-pointer'}`} />
    )
}