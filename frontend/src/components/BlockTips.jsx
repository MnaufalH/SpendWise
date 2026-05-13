import { MdOutlineTipsAndUpdates } from "react-icons/md";

export default function BlockTips({ className = '', message = '', style = {} }) {
    return (
        <div className={className} style={style}>
            <h3 className='fs-6 fw-semibold'><MdOutlineTipsAndUpdates /> Tips</h3>
            <p className='m-0 small'>{message}</p>
        </div>
    )
}
