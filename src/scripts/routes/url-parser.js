function extractPathnameSegments(path) {
  const splitUrl = path.split("/").filter(Boolean);

  return {
    resource: splitUrl[0] || null,
    id: splitUrl[1] || null,
  };
}

function constructRouteFromSegments(pathSegments) {
  let pathname = "";

  if (pathSegments.resource) {
    pathname = `/${pathSegments.resource}`;
  }

  if (pathSegments.id) {
    pathname += "/:id"; // Menyesuaikan rute dengan ID dinamis
  }

  return pathname || "/";
}

export function getActivePathname() {
  return location.hash.replace("#", "") || "/";
}

export function getActiveRoute() {
  const pathname = getActivePathname();
  const urlSegments = extractPathnameSegments(pathname);
  return constructRouteFromSegments(urlSegments);
}

export function parseActivePathname() {
  return extractPathnameSegments(getActivePathname());
}

export function getRoute(pathname) {
  return constructRouteFromSegments(extractPathnameSegments(pathname));
}

export function parsePathname(pathname) {
  return extractPathnameSegments(pathname);
}
