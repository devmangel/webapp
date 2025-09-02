import React from "react";
import { Typography, Button, Card, CardBody } from "@material-tailwind/react";
import Link from "next/link";

interface ErrorCardProps {
  icon: string;
  buttonName: string;
  link: string;
}

const contents = [
  {
    buttonName: "Inicio",
    icon: "fa-home",
    link: "/",
  },
  {
    buttonName: "Servicios",
    icon: "fa-lock",
    link: "/",
  },
  {
    buttonName: "Contacto",
    icon: "fa-message",
    link: "/#contact",
  },
];

export function ErrorCard({ icon, buttonName, link }: ErrorCardProps) {
  return (
    <Card>
      <CardBody className="max-w-[11rem] p-10 flex justify-center align-middle">
        <div className="mb-5 grid items-center">
          <i className={`fas text-3xl ${icon}`} />
        </div>
        <Link href={link}>
          <Button color="primary" isFullWidth>
            {buttonName}
          </Button>
        </Link>
      </CardBody>
    </Card>
  );
}

export function NotFound() {
  return (
    <section className="py-20 md:py-4">
      <div className="relative min-h-screen w-full ">
        <div className="grid min-h-screen px-8">
          <div className="container relative z-10 my-auto mx-auto grid place-items-center text-center">
            <Typography
              variant="h1"
              color="primary"
              className="text-4xl leading-snug lg:text-9xl"
            >
              Error 404
            </Typography>
            <Typography
              variant="h1"
              color="primary"
              className="mt-6 text-4xl !leading-snug lg:text-3xl text-foreground-light"
            >
              Sorry, We Misplaced That Page
            </Typography>
            <Typography
              variant="lead"
              color="primary"
              className="mt-4 mb-6 w-full md:max-w-full lg:mb-12 lg:max-w-3xl text-gray-600"
            >
              Our digital librarian seems to have misplaced the page you
              requested. Stay with us, and we&apos;ll help you rediscover it.{" "}
              <br /> <br />
              Here, instead, you&apos;ll find some useful links:
            </Typography>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 ">
              {contents.map(({ buttonName, icon, link }, index) => (
                <ErrorCard key={index} buttonName={buttonName} icon={icon} link={link} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
export default NotFound;
