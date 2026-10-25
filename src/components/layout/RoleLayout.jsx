/**
 * RoleLayout — role-aware app shell. Shop managers get the full portal shell
 * (ManagerLayout, identical chrome to the Super Admin portal); workers get the
 * focused WorkerLayout workspace.
 */
import { useAuth } from '../../hooks/useAuth'
import { ROLES } from '../../constants/roles'
import ManagerLayout from '../manager/ManagerLayout'
import WorkerLayout from '../worker/WorkerLayout'

const RoleLayout = () => {
  const { user } = useAuth()
  const isManager = user?.role === ROLES.SHOP_MANAGER
  const isWorker = user?.role === ROLES.WORKER
  return isManager ? <ManagerLayout /> : isWorker ? <WorkerLayout /> : <WorkerLayout />
}

export default RoleLayout