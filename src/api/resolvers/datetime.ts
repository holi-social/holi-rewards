import { GraphQLScalarType, Kind } from "graphql";
import { createGraphQLError } from "graphql-yoga";

export const DateTimeISOResolver = new GraphQLScalarType<Temporal.ZonedDateTime, string>({
  name: "DateTimeISO",
  description:
    "A date-time string at UTC, such as 2007-12-03T10:15:30Z, " +
    "compliant with the `date-time` format outlined in section 5.6 of " +
    "the RFC 3339 profile of the ISO 8601 standard for representation " +
    "of dates and times using the Gregorian calendar." +
    "This scalar is serialized to a string in ISO 8601 format and parsed from a string in ISO 8601 format.",

  parseValue: (value) => Temporal.Instant.from(value as string).toZonedDateTimeISO("UTC"),
  serialize: (value) => (value as Temporal.ZonedDateTime).toInstant().toString(),
  parseLiteral: (ast) => {
    if (ast.kind === Kind.STRING) {
      return Temporal.Instant.from(ast.value).toZonedDateTimeISO("UTC");
    }

    throw createGraphQLError("invalid input for type DateTimeISO");
  },
});

export const DateTimeISOTypeDefinition = "scalar DateTimeISO";
