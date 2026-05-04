import { LinkContainer } from "react-router-bootstrap"
import {Table, Button} from 'react-bootstrap'
import { FaTimes, FaTrash, FaEdit, FaCheck } from "react-icons/fa"
import Message from "../../components/Message"
import Loader from '../../components/Loader'
import { toast } from 'react-toastify'
import { useGetUsersQuery, useDeleteUserMutation } from "../../slices/usersApiSlice"

const UserListScreen = () => {

//const result = useGetOrdersQuery();
// console.log("results object", result)
const { data: users, refetch, isLoading, error} = useGetUsersQuery();
const [deleteUser, {isLoading: loadingDelete}] = useDeleteUserMutation();

const deleteHandler = async (userId) => {
  const userToDelete = users.find((user) => user._id === userId);
  const adminCount = users.filter((user) => user.isAdmin).length;

  // block deleting last admin
  if (userToDelete?.isAdmin && adminCount === 1) {
    toast.error('You cannot delete the last admin');
    return;
  }

  if (window.confirm('Are you sure?')) {
    try {
      await deleteUser(userId).unwrap();
      refetch();
      toast.success('User deleted');
    } catch (error) {
      toast.error(error?.data?.message || error.error);
    }
  }
};

  return (
   <>
   <h1>Users</h1>
   {loadingDelete && <Loader />}
   {isLoading ? (
    <Loader /> ) : error ? (
       <Message variant='danger'> {error?.data?.message || error?.error}</Message>
    ) : (
       <Table striped  hover responsive className="table-sm">
          <tr>
            <th>ID</th>
            <th>NAME</th>
            <th>EMAIL</th>
            <th>ADMIN</th>
            <th>EDIT</th>
            <th>DELETE</th>
          </tr>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user._id}</td>
                <td>{user.name}</td>
                <td><a href={`mailto:${user.email}`}>{user.email}</a></td>
                <td>{user.isAdmin ? <FaCheck style={{color: 'green'}} /> : <FaTimes style={{color: 'red'}} />}</td>
                <td><LinkContainer to={`/admin/user/${user._id}/edit`}>
                  <Button 
                  variant='light'
                className="btn-sm">
                    <FaEdit />
                  </Button>
                </LinkContainer></td>
                <td>
                  <Button
                    variant='danger'
                    className="btn-sm"
                    onClick={() => deleteHandler(user._id)}
                    >
                    <FaTrash style={{color: '#fff'}} />
                  </Button>
                </td>
              </tr>

            ))

            }
          </tbody>
       </Table>
    )}
   </>
  )
}

export default UserListScreen