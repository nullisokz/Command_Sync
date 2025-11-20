// namespace server;

// public class SessionExtensions
// {
//     public static UserRole? GetUserRole(this ISession session)
//     {
//         var role = session.GetString("UserRole");

//         if (role != null && Enum.TryParse<UserRole>(role, out var parsedRole))
//             return parsedRole;

//         return null;
//     }
// }
