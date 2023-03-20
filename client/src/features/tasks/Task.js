import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectTaskById } from './tasksApiSlice';

const Task = ({ taskId }) => {
    const task = useSelector(state => selectTaskById(state, taskId));
    const navigate = useNavigate();
    if (task) {
        const created = new Date(task.createdAt).toLocaleString('en-US', { day: 'numeric', month: 'long' });
        const updated = new Date(task.updatedAt).toLocaleString('en-US', { day: 'numeric', month: 'long' });
        const handleEdit = () => navigate(`/dash/tasks/${taskId}`);
        return (
            <tr className="table__row">
                <td className="table__cell task__status">
                    {task.completed
                        ? <span className="task__status--completed">Completed</span>
                        : <span className="task__status--open">Open</span>
                    }
                </td>
                <td className="table__cell task__created">{created}</td>
                <td className="table__cell task__updated">{updated}</td>
                <td className="table__cell task__title">{task.title}</td>
                <td className="table__cell task__username">{task.username}</td>
                <td className="table__cell">
                    <button
                        className="icon-button table__button"
                        onClick={handleEdit}
                    >
                        <FontAwesomeIcon icon={faPenToSquare} />
                    </button>
                </td>
            </tr>
        );
    } else return null;
}
export default Task;