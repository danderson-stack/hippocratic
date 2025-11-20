import {
  Children,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactElement, ReactNode } from "react";

type RouteMatch = { matches: boolean; params: Record<string, string> };

type RouterContextValue = {
  path: string;
  params: Record<string, string>;
  setParams: (params: Record<string, string>) => void;
  navigate: (to: string) => void;
};

const RouterContext = createContext<RouterContextValue | null>(null);

function matchPath(path: string, routePath: string): RouteMatch {
  const pathSegments = path.split("/").filter(Boolean);
  const routeSegments = routePath.split("/").filter(Boolean);

  if (pathSegments.length !== routeSegments.length) {
    return { matches: false, params: {} };
  }

  const params: Record<string, string> = {};

  for (let i = 0; i < routeSegments.length; i += 1) {
    const routeSegment = routeSegments[i];
    const pathSegment = pathSegments[i];

    if (routeSegment.startsWith(":")) {
      params[routeSegment.slice(1)] = pathSegment;
      continue;
    }

    if (routeSegment !== pathSegment) {
      return { matches: false, params: {} };
    }
  }

  return { matches: true, params };
}

export function BrowserRouter({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(() => window.location.pathname);
  const [params, setParams] = useState<Record<string, string>>({});

  useEffect(() => {
    const handler = () => setPath(window.location.pathname);
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  const navigate = useCallback((to: string) => {
    setPath((previousPath) => {
      if (previousPath !== to) {
        window.history.pushState({}, "", to);
        return to;
      }
      return previousPath;
    });
  }, []);

  const value = useMemo(
    () => ({ path, params, setParams, navigate }),
    [navigate, params, path]
  );

  return (
    <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
  );
}

type RouteProps = { path: string; element: ReactNode };

type RoutesProps = { children: ReactNode };

type RouteElement = ReactElement<RouteProps>;

const areParamsEqual = (
  first: Record<string, string>,
  second: Record<string, string>
) => {
  const firstEntries = Object.entries(first);
  const secondEntries = Object.entries(second);

  if (firstEntries.length !== secondEntries.length) return false;

  return firstEntries.every(
    ([key, value]) => Object.prototype.hasOwnProperty.call(second, key) && second[key] === value
  );
};

export function Routes({ children }: RoutesProps) {
  const router = useContext(RouterContext);

  if (!router) {
    throw new Error("Routes must be used within a BrowserRouter");
  }

  const childArray = Children.toArray(children) as RouteElement[];

  const matchedRoute = useMemo(() => {
    for (const child of childArray) {
      if (!isValidElement<RouteProps>(child)) continue;

      const { path: routePath, element } = child.props;
      const { matches, params } = matchPath(router.path, routePath);

      if (matches) {
        return { element, params };
      }
    }
    return null;
  }, [childArray, router.path]);

  useEffect(() => {
    if (!matchedRoute) return;
    if (!areParamsEqual(router.params, matchedRoute.params)) {
      router.setParams(matchedRoute.params);
    }
  }, [matchedRoute, router]);

  return matchedRoute ? <>{matchedRoute.element}</> : null;
}

export function Route(props: RouteProps) {
  return <>{props.element}</>;
}

export function Link({ to, children }: { to: string; children: ReactNode }) {
  const router = useContext(RouterContext);

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    router?.navigate(to);
  };

  return (
    <a href={to} onClick={handleClick}>
      {children}
    </a>
  );
}

export function useParams() {
  const router = useContext(RouterContext);

  if (!router) {
    throw new Error("useParams must be used within a BrowserRouter");
  }

  return router.params;
}
