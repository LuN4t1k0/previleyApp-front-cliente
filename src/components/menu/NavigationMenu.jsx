'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  Dialog,
  DialogPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Popover,
  PopoverButton,
  PopoverGroup,
  PopoverPanel,
} from '@headlessui/react';
import {
  RiArrowDropDownLine,
  RiMenuLine,
  RiCloseFill,
} from '@remixicon/react';
import { menuItems } from '@/config/menuItems';
import { cx } from '@/lib/utils';

const NavigationMenu = () => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [userRole, setUserRole] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const signOutUrl =
    typeof window !== "undefined" ? `${window.location.origin}/signin` : "/signin";

  useEffect(() => {
    if (session?.user?.rol) {
      setUserRole(session.user.rol);
    }
  }, [session]);

  const canAccess = (roles = []) => (userRole ? roles.includes(userRole) : false);

  const plainMenuItems = useMemo(
    () => menuItems.filter((item) => !item.category && canAccess(item.roles)),
    [userRole]
  );

  const groupedMenus = useMemo(
    () =>
      menuItems
        .filter((item) => item.category)
        .map((menu) => ({
          ...menu,
          items: menu.items?.filter((sub) => canAccess(sub.roles)) || [],
        }))
        .filter((menu) => menu.items.length > 0 && menu.category !== 'UserMenu'),
    [userRole]
  );

  const userMenu = useMemo(
    () =>
      menuItems.find((menu) => menu.category === 'UserMenu') || {
        items: [
          {
            name: 'Salir',
            description: 'Cerrar sesión',
            href: '#',
            roles: [],
          },
        ],
      },
    []
  );

  const isActive = (href) => {
    if (!href) return false;
    const baseHref = href.split('?')[0];
    return pathname === baseHref || pathname.startsWith(`${baseHref}/`);
  };

  const handleSignOut = (close) => {
    signOut({ callbackUrl: signOutUrl });
    close?.();
  };

  const renderMenuItem = (item, closeMenu, isUserAction = false) => (
    <Link
      key={item.name}
      href={item.href || '#'}
      className="group flex items-start gap-3 rounded-lg px-3 py-2 text-sm hover:bg-gray-50"
      onClick={() => {
        if (isUserAction && item.name === 'Salir') {
          handleSignOut(closeMenu);
        } else {
          closeMenu?.();
        }
      }}
    >
      {item.icon && (
        <item.icon className="mt-1 h-5 w-5 flex-none text-gray-600 group-hover:text-gray-900" aria-hidden="true" />
      )}
      <div className="flex flex-col">
        <span className="font-semibold text-gray-900">{item.name}</span>
        {item.description && (
          <span className="text-xs text-gray-500">{item.description}</span>
        )}
      </div>
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 lg:px-6">
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="text-sm font-semibold text-gray-900">
            Previley APP
          </Link>
        </div>

        <PopoverGroup className="hidden items-center gap-4 lg:flex">
          {plainMenuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cx(
                'text-sm font-semibold text-gray-700 hover:text-gray-900',
                isActive(item.href) && 'text-indigo-600'
              )}
            >
              {item.name}
            </Link>
          ))}
          {groupedMenus.map((menu) => (
            <Popover key={menu.category} className="relative">
              {({ open, close }) => (
                <>
                  <PopoverButton
                    className={cx(
                      'inline-flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-gray-900',
                      open && 'text-indigo-600'
                    )}
                  >
                    {menu.category}
                    <RiArrowDropDownLine className="h-5 w-5" aria-hidden="true" />
                  </PopoverButton>
                  <PopoverPanel className="absolute left-0 top-full z-30 mt-3 w-72 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
                    <div className="flex flex-col gap-1 p-3">
                      {menu.items.map((item) => renderMenuItem(item, close))}
                    </div>
                  </PopoverPanel>
                </>
              )}
            </Popover>
          ))}
        </PopoverGroup>

        <div className="hidden items-center gap-4 lg:flex">
          {session ? (
            <Popover className="relative">
              {({ close, open }) => (
                <>
                  <PopoverButton
                    className={cx(
                      'inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900',
                      open && 'text-indigo-600'
                    )}
                  >
                    {session.user.nombre}
                    <RiArrowDropDownLine className="h-5 w-5" aria-hidden="true" />
                  </PopoverButton>
                  <PopoverPanel className="absolute right-0 z-30 mt-3 w-64 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
                    <div className="px-4 py-3">
                      <p className="text-sm font-semibold text-gray-900">
                        {session.user.nombre} {session.user.apellido}
                      </p>
                      <p className="text-xs text-gray-500">{session.user.email}</p>
                    </div>
                    <div className="border-t border-gray-100 p-3">
                      {userMenu.items
                        .filter((item) => canAccess(item.roles) || item.name === 'Salir')
                        .map((item) => renderMenuItem(item, close, true))}
                    </div>
                  </PopoverPanel>
                </>
              )}
            </Popover>
          ) : (
            <Link href="/signin" className="text-sm font-semibold text-gray-700 hover:text-gray-900">
              Iniciar sesión
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700"
            onClick={() => setMobileMenuOpen(true)}
          >
            <RiMenuLine className="h-5 w-5" aria-hidden="true" />
            Menú
          </button>
        </div>
      </nav>

      <Dialog
        as="div"
        className="lg:hidden"
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
      >
        <div className="fixed inset-0 z-30 bg-black/25" aria-hidden="true" />
        <DialogPanel className="fixed inset-y-0 right-0 z-40 w-full max-w-sm overflow-y-auto bg-white px-6 py-6 sm:ring-1 sm:ring-gray-200">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="text-base font-semibold text-gray-900" onClick={() => setMobileMenuOpen(false)}>
              Previley APP
            </Link>
            <button
              type="button"
              className="rounded-md p-2 text-gray-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              <RiCloseFill className="h-6 w-6" aria-hidden="true" />
              <span className="sr-only">Cerrar menú</span>
            </button>
          </div>

          <div className="mt-6">
            <div className="space-y-2">
              {groupedMenus.map((menu) => (
                <Disclosure key={menu.category} as="div" className="border-b border-gray-100 pb-2">
                  {({ open }) => (
                    <>
                      <DisclosureButton className="flex w-full items-center justify-between py-2 text-sm font-semibold text-gray-900">
                        {menu.category}
                        <RiArrowDropDownLine
                          className={cx('h-5 w-5 transition-transform', open && 'rotate-180')}
                        />
                      </DisclosureButton>
                      <DisclosurePanel className="mt-2 space-y-1">
                        {menu.items.map((item) => renderMenuItem(item, () => setMobileMenuOpen(false)))}
                      </DisclosurePanel>
                    </>
                  )}
                </Disclosure>
              ))}
            </div>

            <div className="mt-6 border-t border-gray-100 pt-4">
              {session ? (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-900">
                    {session.user.nombre} {session.user.apellido}
                  </p>
                  <p className="text-xs text-gray-500">{session.user.email}</p>
                  {userMenu.items
                    .filter((item) => canAccess(item.roles) || item.name === 'Salir')
                    .map((item) =>
                      item.name === 'Salir' ? (
                        <button
                          key={item.name}
                          type="button"
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-semibold text-gray-900 hover:bg-gray-50"
                          onClick={() => handleSignOut(() => setMobileMenuOpen(false))}
                        >
                          {item.name}
                        </button>
                      ) : (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                        >
                          {item.name}
                        </Link>
                      )
                    )}
                </div>
              ) : (
                <Link
                  href="/signin"
                  className="text-sm font-semibold text-indigo-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Iniciar sesión
                </Link>
              )}
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  );
};

export default NavigationMenu;
