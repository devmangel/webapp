import React from "react";
import Link from "next/link";
import { Typography } from "components/ui/Typography";
import { Button } from "components/ui/Button";
import { Card, CardBody } from "components/ui/Card";

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
  }
];

export function ErrorCard({ icon, buttonName, link }: ErrorCardProps) {
  return (
    <Card>
      <CardBody className="max-w-[11rem] p-10 flex justify-center align-middle">
        <div className="mb-5 grid items-center">
          <i className={`fas text-3xl ${icon}`} />
        </div>
        <Link href={link}>
          <Button color="primary" className="w-full">
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
            <Typography variant="h1" className="text-primary leading-snug lg:text-9xl">
              Error 404
            </Typography>
            <Typography variant="h3" className="mt-6 !leading-snug lg:text-3xl text-foreground-light">
              Sorry, We Misplaced That Page
            </Typography>
            <Typography variant="body1" className="mt-4 mb-6 w-full md:max-w-full lg:mb-12 lg:max-w-3xl text-gray-600">
              Our digital librarian seems to have misplaced the page you
              requested. Stay with us, and we&apos;ll help you rediscover it.{" "}
              <br /> <br />
              Here, instead, you&apos;ll find some useful links:
            </Typography>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-1 ">
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
